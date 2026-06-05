package com.ruki.order.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruki.order.entities.IdempotencyKey;
import com.ruki.order.exceptions.ApiErrorResponse;
import com.ruki.order.repositories.IdempotencyKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.LocalDateTime;

// ESTO SE ASEGURARÁ DE REVISAR SI EL CIENTE TRAE UN NÚMERO DE DE UUID (CLAVE DE IDEMPOTENCIA) EN 
// EL HEADER, SI TIENE UNO ENTONCES SE REVISARÁ PARA VER SI YA FUE PROCESADO, Y EN EL CASO DE QUE 
// YA EXISTA EN LA BASE DE DATOS, SE RECHAZARÁ; EVITANDO DUPLICACIÓNES DE PETICIONES

@Component
@RequiredArgsConstructor
@Slf4j
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String IDEMPOTENCY_HEADER = "Idempotency-Key";
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // DE MOMENTO SOLO NOS IMPORTA VER QUE LOS TICKETS CUANDO EL CLIENTE INTENTE CREAR UN 
        // PEDIDO, LOS GETS NO SERÁN NECESARIOS PARA ESTE TIPO DE ESCENARIOS
        if ("POST".equalsIgnoreCase(request.getMethod()) && request.getRequestURI().contains("/api-ruki/orders/create")) {
            
            String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

            // SI EL FRONT AÚN NO A ENVIADO UN TICKET, LO DEJAMOS PASAR A LA BASE DE DATOS 
            if (idempotencyKey != null && !idempotencyKey.isEmpty()) {
                
                // REVISAMOS LA BASE DE DATOS PARA VER SI YA EXISTE EL REGISTRO 
                if (idempotencyKeyRepository.existsById(idempotencyKey)) {
                    log.warn("IDEMPOTENCIA | Petición duplicada detectada con llave: {}", idempotencyKey);

                    // SI EXISTE, DEVOLVEMOS UN ERROR 409 CON UN MENSAJE CLARO
                    response.setStatus(HttpStatus.CONFLICT.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                            .status(HttpStatus.CONFLICT.value())
                            .error(HttpStatus.CONFLICT.getReasonPhrase())
                            .message("Petición duplicada. Este pedido ya está siendo procesado.")
                            .timestamp(LocalDateTime.now())
                            .path(request.getRequestURI())
                            .build();
                    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                    return; 
                }

                // SI EL TICKET CON LA LLAVE DE IDEMPOTENCIA NO EXISTE, LO GUARDAMOS 
                // EN LA BASE DE DATOS Y MARCAMOS QUE ESTA PETICIÓN YA ESTÁ PROCESADA
                try {
                    idempotencyKeyRepository.save(IdempotencyKey.builder().key(idempotencyKey).build());
                    log.debug("IDEMPOTENCIA | Llave registrada: {}", idempotencyKey);
                } catch (Exception e) {

                    // SI DOS PETICIONES IGUALES LLEGAN AL MISMO TIEMPO, LA BASE DE DATOS 
                    // LANZARÁ UN ERROR DE LLAVE DUPLICADA AL INTENTAR GUARDARLO
                    log.warn("IDEMPOTENCIA | Colisión al guardar llave (posible petición concurrente): {}", idempotencyKey);
                    response.setStatus(HttpStatus.CONFLICT.value());
                    return;
                }
            }
        }

        // SI TODO ESTÁ EN ORDEN, LA CLAVE CORRESPONDIENTE SEGUIRÁ SU FLUJO NORMAL
        filterChain.doFilter(request, response);
    }
}