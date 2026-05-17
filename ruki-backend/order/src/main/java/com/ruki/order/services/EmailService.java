package com.ruki.order.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    /*
        Envia un correo electronico de confirmación de pedido
    */
    @Async
    public void sendOrderConfirmation(String toEmail, Long orderId, BigDecimal totalAmount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "RUKI Store | Confirmations"); 
            
            helper.setTo(toEmail);
            helper.setSubject("¡Tu pedido #" + orderId + " en RUKI ha sido confirmado!");

            String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>"
                    + "<h2>¡Gracias por tu compra en RUKI!</h2>"
                    + "<p>Hemos recibido tu pago correctamente y tu pedido <strong>#" + orderId + "</strong> ya está en preparación.</p>"
                    + "<div style='background-color: #f5f5f7; padding: 15px; border-radius: 10px; margin: 20px 0;'>"
                    + "<p style='margin: 0;'><strong>Total Pagado: </strong> $" + totalAmount + " CLP</p>"
                    + "</div>"
                    + "<p>Te avisaremos cuando tu pedido vaya en camino.</p>"
                    + "<br><p>Atentamente,<br><strong>El equipo de RUKI</strong></p>"
                    + "</div>";

            helper.setText(htmlMsg, true);
            mailSender.send(message);

            log.info("Email de confirmación enviado con éxito a {}", toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar correo de confirmación a {}: {}", toEmail, e.getMessage());
        }
    }

    /*
        Envía notificaciones cuando el Admin actualiza el estado logístico
    */
    @Async
    public void sendOrderStatusUpdate(String toEmail, Long orderId, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            /*
                Usamos un alias distinto 
            */
            helper.setFrom(fromEmail, "RUKI Store | Logistics");
            helper.setTo(toEmail);

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

            helper.setSubject(subject);
            helper.setText(htmlMsg, true);
            mailSender.send(message);

            log.info("Email de actualización de estado ({}) enviado con éxito a {}", status, toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar correo de actualización a {}: {}", toEmail, e.getMessage());
        }
    }

}