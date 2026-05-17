package com.ruki.order.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.mail.password}")
    private String resendApiKey;

    @Value("${app.mail.from}")
    private String fromEmail;

    /*
        Envia un correo electronico de confirmación de pedido
    */
    @Async
    public void sendOrderConfirmation(String toEmail, Long orderId, BigDecimal totalAmount) {
        String subject = "¡Tu pedido #" + orderId + " en RUKI ha sido confirmado!";
        
        String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>"
                + "<h2>¡Gracias por tu compra en RUKI!</h2>"
                + "<p>Hemos recibido tu pago correctamente y tu pedido <strong>#" + orderId + "</strong> ya está en preparación.</p>"
                + "<div style='background-color: #f5f5f7; padding: 15px; border-radius: 10px; margin: 20px 0;'>"
                + "<p style='margin: 0;'><strong>Total Pagado: </strong> $" + totalAmount + " CLP</p>"
                + "</div>"
                + "<p>Te avisaremos cuando tu pedido vaya en camino.</p>"
                + "<br><p>Atentamente,<br><strong>El equipo de RUKI</strong></p>"
                + "</div>";

        // Disparamos usando el motor HTTPS con el alias de "Confirmations"
        sendViaResendHttpApi(toEmail, subject, htmlMsg, "RUKI Store | Confirmations");
    }

    /*
        Envía notificaciones cuando el Admin actualiza el estado logístico
    */
    @Async
    public void sendOrderStatusUpdate(String toEmail, Long orderId, String status) {
        String subject = "";
        String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>";

        /*
            Evaluando qué mensaje mostrar según el estado
        */
        if (status.equals("SHIPPED")) {
            subject = "¡Tu pedido #" + orderId + " va en camino!";
            htmlMsg += "<h2>¡Buenas noticias!</h2>"
                    + "<p>Tu pedido <strong>#" + orderId + "</strong> ha sido entregado a nuestra empresa de transporte y va en camino a tu dirección.</p>";
        } else if (status.equals("DELIVERED")) {
            subject = "¡Tu pedido #" + orderId + " ha sido entregado!";
            htmlMsg += "<h2>¡Pedido Entregado!</h2>"
                    + "<p>Tu pedido <strong>#" + orderId + "</strong> figura como entregado exitosamente. ¡Esperamos que disfrutes tus productos RUKI!</p>";
        } else if (status.equals("CANCELLED")) {
            subject = "Aviso: Tu pedido #" + orderId + " ha sido cancelado";
            htmlMsg += "<h2>Pedido Cancelado</h2>"
                    + "<p>Lamentamos informarte que tu pedido <strong>#" + orderId + "</strong> ha sido cancelado en nuestro sistema.</p>"
                    + "<p>Si realizaste un pago, el reembolso se procesará según las políticas de tu banco. Si tienes dudas, contáctanos a soporte.</p>";
        } else {
            /*
                Si es PENDING u otro estado fantasma, no enviamos nada
            */
            return; 
        }

        htmlMsg += "<br><p>Atentamente,<br><strong>El equipo de RUKI</strong></p></div>";

        // Disparamos usando el motor HTTPS con el alias de "Logistics"
        sendViaResendHttpApi(toEmail, subject, htmlMsg, "RUKI Store | Logistics");
    }

    /*
        EL MOTOR HTTPS (El que evade el Firewall de DigitalOcean)
    */
    private void sendViaResendHttpApi(String to, String subject, String htmlContent, String aliasName) {
        try {
            // Unimos el alias con el correo real. Ej: "RUKI Store | Logistics <onboarding@resend.dev>"
            String fromWithAlias = aliasName + " <" + fromEmail + ">";

            Map<String, Object> body = Map.of(
                    "from", fromWithAlias,
                    "to", List.of(to),
                    "subject", subject,
                    "html", htmlContent
            );

            String jsonBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("ÉXITO: Email enviado a {} (Estado: {}) evadiendo firewall de DO", to, subject);
            } else {
                log.error("Fallo Resend API (HTTP {}): {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("Error crítico al conectar con Resend API: {}", e.getMessage());
        }
    }
}