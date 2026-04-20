package com.ruki.payment.controllers;

import com.ruki.payment.entities.PaymentRecord;
import com.ruki.payment.services.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api-ruki/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    // 1. Endpoint para crear el pago (Usado por Postman / React)
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestParam Long orderId) {
        log.info("Iniciando cobro con RukiPay para la Orden #{}", orderId);
        String url = paymentService.createPayment(orderId);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // 2. LA PANTALLA FALSA DE PAGO (Devuelve HTML)
    @GetMapping(value = "/checkout", produces = MediaType.TEXT_HTML_VALUE)
    public String showCheckoutScreen(@RequestParam String token) {
        // Un HTML simple, elegante y moderno inyectado directamente desde Java
        return """
            <html>
                <body style='font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0;'>
                    <div style='background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px;'>
                        <h2 style='color: #2563eb; margin-bottom: 5px;'>💳 RukiPay Gateway</h2>
                        <p style='color: #6b7280; font-size: 14px; margin-bottom: 30px;'>Entorno seguro de simulación de pagos</p>
                        
                        <div style='background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 30px; text-align: left;'>
                            <p style='margin: 0; font-size: 12px; color: #64748b;'>Token de Transacción:</p>
                            <p style='margin: 5px 0 0 0; font-size: 11px; font-family: monospace; color: #0f172a; word-break: break-all;'>%s</p>
                        </div>

                        <form action='/api-ruki/payments/process' method='POST'>
                            <input type='hidden' name='token' value='%s'>
                            <button type='submit' style='background: #10b981; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; width: 100%%; font-weight: bold; transition: background 0.3s;'>
                                Simular Pago Exitoso
                            </button>
                        </form>
                    </div>
                </body>
            </html>
            """.formatted(token, token);
    }

    // 3. Endpoint que procesa el click del botón
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestParam String token) {
        log.info("Procesando pago en RukiPay...");
        PaymentRecord result = paymentService.confirmPayment(token);
        
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "¡Dinero recibido! La Orden #" + result.getOrderId() + " ha sido pagada y actualizada en Pedidos."
        ));
    }
}