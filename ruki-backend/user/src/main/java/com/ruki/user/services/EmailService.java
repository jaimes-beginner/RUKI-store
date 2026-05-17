package com.ruki.user.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String frontendUrl;

    /*
        Envío de email para recuperación de contraseña
    */
    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "RUKI Store | Seguridad");
            helper.setTo(toEmail);
            helper.setSubject("Recupera tu contraseña de RUKI Store");

            /*
                Armamos el link seguro que llevará al usuario a React
            */
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String htmlMsg = "<div style='font-family: Arial, sans-serif; color: #1d1d1f;'>"
                    + "<h2>¿Olvidaste tu contraseña?</h2>"
                    + "<p>No te preocupes, haz clic en el siguiente enlace para crear una nueva:</p>"
                    + "<div style='margin: 20px 0;'>"
                    + "<a href='" + resetLink + "' style='background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Restablecer Contraseña</a>"
                    + "</div>"
                    + "<p><small>Este enlace expirará en 15 minutos. Si no solicitaste esto, ignora este correo.</small></p>"
                    + "</div>";

            helper.setText(htmlMsg, true);
            mailSender.send(message);

            log.info("Email de recuperación enviado a {}", toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar correo de recuperación a {}: {}", toEmail, e.getMessage());
        }
    }

    /*
        Envio de alerta de seguridad post-cambio de contraseña
    */
    @Async
    public void sendPasswordChangedNotification(String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "RUKI Store | Seguridad");
            helper.setTo(toEmail);
            helper.setSubject("Aviso de Seguridad: Contraseña Modificada");

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

            helper.setText(htmlMsg, true);
            mailSender.send(message);

            log.info("Email de alerta de cambio de contraseña enviado a {}", toEmail);
        } catch (Exception e) {
            log.error("Fallo al enviar correo de alerta de seguridad a {}: {}", toEmail, e.getMessage());
        }
    }

}