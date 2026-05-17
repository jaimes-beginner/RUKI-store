package com.ruki.user.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
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

    /*
        Para armar un JSON seguro
    */
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.mail.password}")
    private String resendApiKey;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String frontendUrl;

    /*
        Enviamos el correo de recuperación de contraseña
    */
    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>"
                + "<h2>¿Olvidaste tu contraseña?</h2>"
                + "<p>No te preocupes, haz clic en el siguiente enlace para crear una nueva:</p>"
                + "<div style='margin: 20px 0;'>"
                + "<a href='" + resetLink + "' style='background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Restablecer Contraseña</a>"
                + "</div>"
                + "<p><small>Este enlace expirará en 15 minutos. Si no solicitaste esto, ignora este correo.</small></p>"
                + "</div>";

        sendViaResendHttpApi(toEmail, "Recupera tu contraseña de RUKI Store", htmlMsg);
    }

    /*
        Enviamos el correo de constraseña cambiada
    */
    @Async
    public void sendPasswordChangedNotification(String toEmail) {
        String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>"
                + "<h2>Actualización de Seguridad</h2>"
                + "<p>Hola,</p>"
                + "<p>Te informamos que la contraseña de tu cuenta en <strong>RUKI Store</strong> acaba de ser modificada exitosamente.</p>"
                + "<p>Si fuiste tú, no necesitas hacer nada más. Puedes ignorar este correo.</p>"
                + "<div style='background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;'>"
                + "<p style='margin: 0; color: #b71c1c;'><strong>¿No reconoces esta acción?</strong></p>"
                + "<p style='margin: 5px 0 0 0;'>Por favor, contacta inmediatamente a nuestro equipo de soporte para proteger tu cuenta.</p>"
                + "</div>"
                + "<br><p>Atentamente,<br><strong>El equipo de Seguridad de RUKI</strong></p>"
                + "</div>";

        sendViaResendHttpApi(toEmail, "Aviso de Seguridad: Contraseña Modificada", htmlMsg);
    }

    /*
        Envíar el correo por el puerto 443 (HTTPS)
        para evadir cualquier bloqueo de DigitalOcean
    */
    private void sendViaResendHttpApi(String to, String subject, String htmlContent) {
        try {
            
            /*
                Armamos el cuerpo del mensaje a la API de Resend
            */
            Map<String, Object> body = Map.of(
                    "from", "RUKI Store <" + fromEmail + ">",
                    "to", List.of(to),
                    "subject", subject,
                    "html", htmlContent
            );

            String jsonBody = objectMapper.writeValueAsString(body);

            /*
                Preparamos la petición web (Pasamos la API Key en el Header)
            */
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            
            /*
                Disparamos la petición
            */
            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            /*
                Verificamos si Resend nos dio un 200 OK
            */
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("ÉXITO | Email enviado a {} evadiendo firewall de DO mediante HTTPS", to);
            } else {
                log.error("Fallo Resend API (HTTP {}): {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("Error crítico al conectar con Resend API: {}", e.getMessage());
        }
    }
}