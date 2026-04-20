package com.ruki.payment.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) 
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_LOG_VAR = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        /* 
                Intentamos leer el ID si ya viene de otro microservicio
        */
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        
        /* 
                Si no trae, generamos uno nuevo para esta transacción
        */
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        /* 
            Lo metemos en el MDC (Mapped Diagnostic Context) de los logs
        */
        MDC.put(CORRELATION_ID_LOG_VAR, correlationId);
        
        /* 
            Se lo agregamos a la respuesta para que el Frontend también lo tenga
        */
        response.addHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {

            /* 
                Limpiamos al salir para no mezclar peticiones
            */
            MDC.remove(CORRELATION_ID_LOG_VAR);
        }
    }

}