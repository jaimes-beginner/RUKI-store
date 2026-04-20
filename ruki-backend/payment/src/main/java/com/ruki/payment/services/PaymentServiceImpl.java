package com.ruki.payment.services;

import com.ruki.payment.clients.OrderClient;
import com.ruki.payment.entities.PaymentRecord;
import com.ruki.payment.entities.PaymentStatus;
import com.ruki.payment.repositories.PaymentRecordRepository;
import com.ruki.payment.requests.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService { 

    private final PaymentRecordRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${app.payments.base-url}")
    private String paymentBaseUrl;

    /*
        Iniciar un pago
    */
    public String createPayment(Long orderId) {
        OrderResponse order = orderClient.getOrderById(orderId);

        try {
            // 1. Generamos un token único de seguridad para esta transacción
            String rukiToken = "RUKI-" + UUID.randomUUID().toString();

            // 2. Guardamos en Base de Datos como PENDIENTE
            PaymentRecord record = PaymentRecord.builder()
                    .orderId(orderId)
                    .amount(order.getTotalAmount())
                    .tokenWs(rukiToken) // Usamos nuestro propio token
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(record);

            log.info("Transacción RukiPay creada. Token: {}", rukiToken);


            return paymentBaseUrl + "/api-ruki/payments/checkout?token=" + rukiToken;
        } catch (Exception e) {
            log.error("❌ Error interno al crear transacción RukiPay", e);
            throw new RuntimeException("No se pudo iniciar el pago en RukiPay");
        }
    }

    /*
     * PASO 2: EL RETORNO (Confirmar Pago)
     */
    public PaymentRecord confirmPayment(String token) {
        try {
            PaymentRecord record = paymentRepository.findByTokenWs(token)
                    .orElseThrow(() -> new RuntimeException("Pago fantasma: Token no encontrado en BD"));

            log.info("💰 ¡Pago APROBADO en RukiPay para la Orden #{}!", record.getOrderId());
            
            // Actualizamos nuestra BD de pagos
            record.setStatus(PaymentStatus.SUCCESS);
            
            // ¡EL TELÉFONO ROJO! Le avisamos al microservicio de Pedidos que ya pagaron
            orderClient.updateOrderStatus(record.getOrderId(), "PAID");

            return paymentRepository.save(record);

        } catch (Exception e) {
            log.error("❌ Error al procesar pago en RukiPay", e);
            throw new RuntimeException("Error al validar el pago");
        }
    }
    
}