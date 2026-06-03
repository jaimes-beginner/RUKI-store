package com.ruki.payment.services;

import com.ruki.payment.clients.OrderClient;
import com.ruki.payment.entities.PaymentRecord;
import com.ruki.payment.entities.PaymentStatus;
import com.ruki.payment.exceptions.ResourceNotFoundException; /* Importar excepción */
import com.ruki.payment.repositories.PaymentRecordRepository;
import com.ruki.payment.requests.OrderResponse;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; /* Importar Transactional */

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional /* Añadir Transactional a nivel de clase */
public class PaymentServiceImpl implements PaymentService { 

    private final PaymentRecordRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /*
        Método para crear un pago de un pedido correspondiente
    */
    @Override
    public String createPayment(Long orderId) {
        OrderResponse order;
        try {
            order = orderClient.getOrderById(orderId);
        } catch (Exception e) {
            /* Si el cliente Feign falla, lanzamos nuestra alarma específica */
            log.error("Error al buscar la orden {} en el microservicio de pedidos", orderId);
            throw new ResourceNotFoundException("La orden con ID " + orderId + " no existe o no se pudo acceder.");
        }
        
        Stripe.apiKey = stripeApiKey;

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/pago-exitoso?orderId=" + orderId)
                    .setCancelUrl(frontendUrl + "/checkout?error=cancelado")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("clp") 
                                                    .setUnitAmount(order.getTotalAmount().longValue()) 
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Orden #" + orderId + " - RUKI Store")
                                                                    .build())
                                                    .build())
                                    .build())
                    .putMetadata("orderId", String.valueOf(orderId))
                    .build();

            Session session = Session.create(params);

            /* Usamos el Builder que acabamos de añadir */
            PaymentRecord record = PaymentRecord.builder()
                    .orderId(orderId)
                    .amount(order.getTotalAmount())
                    .tokenWs(session.getId()) 
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(record);

            log.info("Sesión de Stripe creada con éxito. SessionID: {}", session.getId());
            return session.getUrl();
            
        } catch (Exception e) {
            log.error("Error interno al crear sesión en Stripe", e);
            throw new RuntimeException("No se pudo iniciar el pago con Stripe");
        }
    }

    @Override
    public void confirmPaymentFromWebhook(String stripeSessionId, Long orderId) {
        try {
            PaymentRecord record = paymentRepository.findByTokenWs(stripeSessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pago fantasma: Sesión no encontrada en BD"));

            if (record.getStatus() == PaymentStatus.SUCCESS) {
                log.info("Reintentando aviso a Pedidos para la Orden #{}", record.getOrderId());
                orderClient.updateOrderStatus(record.getOrderId(), "PAID");
                return; 
            }

            log.info("¡Pago APROBADO por Stripe para la Orden #{}!", record.getOrderId());
            
            orderClient.updateOrderStatus(record.getOrderId(), "PAID");

            record.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(record);

        } catch (ResourceNotFoundException e) {
            throw e; /* Dejamos pasar nuestra excepción limpia */
        } catch (Exception e) {
            log.error("Error al procesar el pago de Stripe", e);
            throw new RuntimeException("Error al validar el pago");
        }
    }
}