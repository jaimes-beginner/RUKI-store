package com.ruki.payment.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruki.payment.services.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
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
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            log.info("CORRECTO | Webhook recibido y firma validada.");
        } catch (SignatureVerificationException e) {
            log.error("ERROR | Firma de Webhook inválida.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("ERROR | Error procesando payload del Webhook.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                /*
                    TRUCO DE ARQUITECTO: Bypass al SDK de Stripe. 
                    Leemos el JSON crudo directamente para evitar el choque de versiones.
                */
                String rawJson = event.getDataObjectDeserializer().getRawJson();
                JsonNode sessionNode = new ObjectMapper().readTree(rawJson);
                
                String sessionId = sessionNode.get("id").asText();
                String orderIdStr = sessionNode.path("metadata").path("orderId").asText(null);
                
                if (orderIdStr != null) {
                    Long orderId = Long.parseLong(orderIdStr);
                    log.info("JSON parseado a la fuerza. Validando pago de la Orden: {}", orderId);
                    
                    paymentService.confirmPaymentFromWebhook(sessionId, orderId);
                } else {
                    log.error("ERROR | La sesión de Stripe no tiene el 'orderId' en los metadatos.");
                }
            } catch (Exception e) {
                log.error("ERROR | procesando el JSON manualmente", e);
            }
        }

        return ResponseEntity.ok("Success");
    }

}