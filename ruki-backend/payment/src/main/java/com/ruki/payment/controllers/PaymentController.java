package com.ruki.payment.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruki.payment.exceptions.ApiErrorResponse;
import com.ruki.payment.services.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; /* Importar PreAuthorize */
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api-ruki/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pagos (Stripe)", description = "Pasarela de pagos oficial integrada con Stripe")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    /*
        Endpoint para hacer un checkout de pago
    */
    @PostMapping("/create")
    @Operation(summary = "Generar link de pago", description = "Crea una sesión en Stripe para una orden. (Requiere autenticación)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Link generado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<?> createPayment(@RequestParam Long orderId) {
        log.info("Iniciando cobro con Stripe para la Orden #{}", orderId);
        String url = paymentService.createPayment(orderId);
        return ResponseEntity.ok(Map.of("url", url));
    }

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