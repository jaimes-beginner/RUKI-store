package com.ruki.order.security;

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
            Intenta leer el ID de correlación si ya viene en el encabezado de 
            la petición. Esto es útil si la petición viene de otro microservicio 
            o de un API Gateway que ya le puso una etiqueta
        */
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);

        /*
            Si la petición no trae un ID de correlación, generamos uno nuevo 
            único para esta transacción
        */
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        /*
            Guardamos este ID en el "contexto de diagnóstico" de los logs (MDC)
            Esto significa que cada mensaje de log que se genere durante esta petición
            tendrá este ID de correlación asociado, como si fuera un número de seguimiento
        */
        MDC.put(CORRELATION_ID_LOG_VAR, correlationId);

        /*
            Añadimos este ID de correlación al encabezado de la respuesta HTTP
            Así, el frontend o el siguiente microservicio en la cadena también
            pueden ver este ID y usarlo para sus propios logs o seguimiento
        */
        response.addHeader(CORRELATION_ID_HEADER, correlationId);

        try {

            /*
                Dejamos que la petición siga su camino normal a través de los otros filtros
                y controladores de la aplicación
            */
            filterChain.doFilter(request, response);
        } finally {
            
            /*
                Una vez que la petición ha terminado (ya sea con éxito o con error)
                limpiamos el ID de correlación del contexto de logs. Esto es crucial 
                para que el ID de una petición no se mezcle accidentalmente con los 
                logs de la siguiente petición
            */
            MDC.remove(CORRELATION_ID_LOG_VAR);
        }
    }
}