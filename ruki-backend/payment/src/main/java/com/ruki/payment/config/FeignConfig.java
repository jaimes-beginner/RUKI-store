package com.ruki.payment.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/*
     El mensajero que lleva la tarjeta de identidad y el número de seguimiento
     al microservicio de pedidos.
*/
@Configuration
@Slf4j
public class FeignConfig implements RequestInterceptor {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && !authHeader.isEmpty()) {
                template.header("Authorization", authHeader);
            }

            /* Reenviar el ID de rastreo */
            String correlationId = MDC.get(CORRELATION_ID_HEADER);
            if (correlationId != null && !correlationId.isEmpty()) {
                template.header(CORRELATION_ID_HEADER, correlationId);
            }
        } else {
            log.warn("FEIGN | No se pudo obtener el contexto HTTP. Normal en Webhooks asíncronos.");
        }
    }
}