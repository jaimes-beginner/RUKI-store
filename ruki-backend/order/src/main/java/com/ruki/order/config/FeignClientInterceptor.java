package com.ruki.order.config;

import com.ruki.order.security.JwtUtils;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Component
@RequiredArgsConstructor 
@Slf4j
public class FeignClientInterceptor implements RequestInterceptor {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    
    private final JwtUtils jwtUtils; 

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {

            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && !authHeader.isEmpty()) {
                template.header("Authorization", authHeader);
                log.debug("FEIGN INTERCEPTOR | Token JWT reenviado a FeignClient para la petición a {}", template.url());
            } else {
                log.warn("FEIGN INTERCEPTOR | No se encontró token JWT en la petición entrante para reenviar a FeignClient a {}", template.url());
            }

            String correlationId = MDC.get(CORRELATION_ID_HEADER); 
            if (correlationId != null && !correlationId.isEmpty()) {
                template.header(CORRELATION_ID_HEADER, correlationId);
                log.debug("FEIGN INTERCEPTOR | Correlation ID {} reenviado a FeignClient para la petición a {}", correlationId, template.url());
            }

        } else {

            log.warn("FEIGN INTERCEPTOR | No se pudo obtener RequestContextHolder. Generando Token de SISTEMA para llamada asíncrona a {}", template.url());
            
            String systemToken = jwtUtils.generateToken(
                    Jwts.claims(), 
                    99999999L, 
                    "system@ruki.com", 
                    List.of("ROLE_ADMIN")
            );

            template.header("Authorization", "Bearer " + systemToken);
        }
    }
}