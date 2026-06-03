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

     private final ObjectMapper objectMapper;

     /*
          La llave secreta para usar el servicio de correos Resend
     */
     @Value("${spring.mail.password}") 
     private String resendApiKey;

     /*
          El correo electrónico desde donde se envían los mensajes
     */
     @Value("${app.mail.from}")
     private String fromEmail;

     /*
          Envía un correo electrónico de confirmación de pedido.
          Lo hace en segundo plano (@Async) para no bloquear la aplicación
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

          /*
               Disparamos usando el motor HTTPS con el alias de "Confirmations"
          */
          sendViaResendHttpApi(toEmail, subject, htmlMsg, "RUKI Store | Confirmations");
          log.info("EMAIL | Correo de confirmación enviado para el pedido #{} a {}", orderId, toEmail);
     }

     /*
          Envía notificaciones cuando el Administrador actualiza el estado 
          logístico de un pedido. También lo hace en segundo plano
     */
     @Async
     public void sendOrderStatusUpdate(String toEmail, Long orderId, String status) {
          String subject = "";
          String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>";

          /*
               Evaluando qué mensaje mostrar según el estado del pedido
          */
          if ("SHIPPED".equals(status)) { 
               subject = "¡Tu pedido #" + orderId + " va en camino!";
               htmlMsg += "<h2>¡Buenas noticias!</h2>"
                    + "<p>Tu pedido <strong>#" + orderId + "</strong> ha sido entregado a nuestra empresa de transporte y va en camino a tu dirección.</p>";
          } else if ("DELIVERED".equals(status)) { 
               subject = "¡Tu pedido #" + orderId + " ha sido entregado!";
               htmlMsg += "<h2>¡Pedido Entregado!</h2>"
                    + "<p>Tu pedido <strong>#" + orderId + "</strong> figura como entregado exitosamente. ¡Esperamos que disfrutes tus productos RUKI!</p>";
          } else if ("CANCELLED".equals(status)) { 
               subject = "Aviso: Tu pedido #" + orderId + " ha sido cancelado";
               htmlMsg += "<h2>Pedido Cancelado</h2>"
                    + "<p>Lamentamos informarte que tu pedido <strong>#" + orderId + "</strong> ha sido cancelado en nuestro sistema.</p>"
                    + "<p>Si realizaste un pago, el reembolso se procesará según las políticas de tu banco. Si tienes dudas, contáctanos a soporte.</p>";
          } else {

               /*
                    Si es PENDING u otro estado que no requiere 
                    notificación, no enviamos nada
               */
               log.debug("EMAIL | No se envió notificación para el pedido #{} con estado {}. No requiere notificación.", orderId, status);
               return;
          }

          htmlMsg += "<br><p>Atentamente,<br><strong>El equipo de RUKI</strong></p></div>";

          /*
               Disparamos usando el motor HTTPS con el alias de "Logistics"
          */
          sendViaResendHttpApi(toEmail, subject, htmlMsg, "RUKI Store | Logistics");
          log.info("EMAIL | Notificación de estado '{}' enviada para el pedido #{} a {}", status, orderId, toEmail);
     }

     /*
          EL MOTOR HTTPS (El que evade el Firewall de DigitalOcean) Este método 
          es el que realmente se conecta a la API de Resend para enviar el correo
     */
     private void sendViaResendHttpApi(String to, String subject, String htmlContent, String aliasName) {
          try {

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
                    log.info("EMAIL | ÉXITO: Correo enviado a {} (Asunto: '{}') a través de Resend API. HTTP Status: {}", to, subject, response.statusCode());
               } else {
                    log.error("EMAIL | FALLO: Resend API (HTTP {}): {} al intentar enviar correo a {} (Asunto: '{}').", response.statusCode(), response.body(), to, subject);
               }

          } catch (Exception e) {
               log.error("EMAIL | ERROR CRÍTICO: Fallo al conectar con Resend API para enviar correo a {} (Asunto: '{}'): {}", to, subject, e.getMessage(), e);
          }
     }

}