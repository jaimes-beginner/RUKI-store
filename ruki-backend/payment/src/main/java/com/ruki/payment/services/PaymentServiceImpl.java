package com.ruki.payment.services;

import com.ruki.payment.clients.OrderClient;
import com.ruki.payment.entities.PaymentRecord;
import com.ruki.payment.entities.PaymentStatus;
import com.ruki.payment.repositories.PaymentRecordRepository;
import com.ruki.payment.requests.OrderResponse;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService { 

    private final PaymentRecordRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /*
        Iniciar un pago conectando con Stripe
    */
    @Override
    public String createPayment(Long orderId) {
        OrderResponse order = orderClient.getOrderById(orderId);
        
        /*
            Inicializamos Stripe con tu llave secreta
        */
        Stripe.apiKey = stripeApiKey;

        try {
            /*
                Construimos los parámetros de la sesión de Stripe
            */
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
                                                    .setCurrency("clp") // Pesos chilenos (no usan decimales en Stripe)
                                                    .setUnitAmount(order.getTotalAmount().longValue()) 
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Orden #" + orderId + " - RUKI Store")
                                                                    .build())
                                                    .build())
                                    .build())
                    /*
                        Guardamos el ID de la orden como metadato oculto
                    */
                    .putMetadata("orderId", String.valueOf(orderId))
                    .build();

            /*
                Creamos la sesión oficial en los servidores de Stripe
            */
            Session session = Session.create(params);

            /*
                Guardamos en BD usando el ID de la sesión de Stripe como token
            */
            PaymentRecord record = PaymentRecord.builder()
                    .orderId(orderId)
                    .amount(order.getTotalAmount())
                    .tokenWs(session.getId()) 
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(record);

            log.info("Sesión de Stripe creada con éxito. SessionID: {}", session.getId());

            /*
                Devolvemos la URL segura de Stripe
            */
            return session.getUrl();
            
        } catch (Exception e) {
            log.error("Error interno al crear sesión en Stripe", e);
            throw new RuntimeException("No se pudo iniciar el pago con Stripe");
        }
    }

    /*
        Retorno de la confirmación del pago (Vía Webhook)
    */
    public void confirmPaymentFromWebhook(String stripeSessionId, Long orderId) {
        try {
            PaymentRecord record = paymentRepository.findByTokenWs(stripeSessionId)
                    .orElseThrow(() -> new RuntimeException("Pago fantasma: Sesión no encontrada en BD"));

            if (record.getStatus() == PaymentStatus.SUCCESS) {

                /*
                    Si por alguna razón el pago ya estaba en SUCCESS  localmente
                    pero pedidos no se enteró, entonces forzamos la llamada de nuevo
                    antes de salir
                */
                log.info("Reintentando aviso a Pedidos para la Orden #{}", record.getOrderId());
                orderClient.updateOrderStatus(record.getOrderId(), "PAID");
                return; 
            }

            log.info("¡Pago APROBADO por Stripe para la Orden #{}!", record.getOrderId());
            
            /*
                Avisamos al servicio de pedidos, si esto falla entonces
                no se guardará como SUCCESS
            */
            orderClient.updateOrderStatus(record.getOrderId(), "PAID");

            /*
                Si pedios responde bien, recién ahí guardaremos 
                el éxito en el servicio de Pagos
            */
            record.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(record);

        } catch (Exception e) {
            log.error("Error al procesar el pago de Stripe", e);
            throw new RuntimeException("Error al validar el pago");
        }
    }
}