package com.ruki.payment.controllers;

import com.ruki.payment.services.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api-ruki/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pagos (Stripe)", description = "Pasarela de pagos oficial integrada con Stripe")
public class PaymentController {

    private final PaymentService paymentService;

    /*
        Llave secreta del Webhook (Para que nadie pueda falsificar un pago)
    */
    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    /* 
        Endpoint que React llama para generar el pago
    */
    @PostMapping("/create")
    @Operation(summary = "Generar link de pago", description = "Crea una sesión en Stripe para una orden. (Requiere autenticación)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> createPayment(@RequestParam Long orderId) {
        log.info("Iniciando cobro con Stripe para la Orden #{}", orderId);
        String url = paymentService.createPayment(orderId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /* 
        Webhook: Endpoint público oculto al que Stripe llama cuando el pago es exitoso
    */
    @PostMapping("/webhook")
    @Operation(summary = "Stripe Webhook", description = "Escucha eventos desde los servidores de Stripe.")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            /*
                Verificamos matemáticamente que la petición 
                viene de Stripe y no de un hacker
            */
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Firma de Webhook inválida. Intento de falsificación detectado.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error procesando payload del Webhook.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        /*
            Si el evento nos dice que la sesión de pago 
            finalizó con éxito
        */
        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            
            if (dataObjectDeserializer.getObject().isPresent()) {
                Session session = (Session) dataObjectDeserializer.getObject().get();
                
                String sessionId = session.getId();
                
                /*
                    Recuperamos el ID de la orden que guardamos antes
                */
                Long orderId = Long.parseLong(session.getMetadata().get("orderId"));
                
                /*
                    Confirmamos el pago en la base de datos y notificamos a Pedidos
                */
                paymentService.confirmPaymentFromWebhook(sessionId, orderId);
            }
        }

        return ResponseEntity.ok("Success");
    }
}