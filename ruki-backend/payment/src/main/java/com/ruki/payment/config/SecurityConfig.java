package com.ruki.payment.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ruki.payment.exceptions.ApiErrorResponse; 
import com.ruki.payment.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    /*
        El traductor oficial. Lo configuramos aquí 
        para evitar el error de las fechas
    */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                /* 
                    Rutas de STRIPE WEBHOOK. Vital para que Stripe avise sin token
                */
                .requestMatchers(
                    "/api-ruki/payments/checkout", 
                    "/api-ruki/payments/process", 
                    "/api-ruki/payments/webhook"
                ).permitAll()
                
                /* 
                    La pasarela no tiene JWT, esta ruta debe ser pública
                */
                .requestMatchers(HttpMethod.GET, 
                    "/api-ruki/payments/callback"
                ).permitAll()
                
                /* 
                    Las rutas de Swagger
                */
                .requestMatchers(
                    "/v3/api-docs/**", 
                    "/swagger-ui/**", 
                    "/swagger-ui.html"
                ).permitAll()
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                            .status(HttpStatus.UNAUTHORIZED.value())
                            .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                            .message("No autorizado: " + authException.getMessage())
                            .timestamp(LocalDateTime.now())
                            .path(request.getRequestURI())
                            .build();
                    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                    log.warn("AUDITORÍA DE SEGURIDAD (401): Acceso no autorizado a {}", request.getRequestURI());
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                            .status(HttpStatus.FORBIDDEN.value())
                            .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                            .message("Acceso denegado: No tienes permisos para este recurso.")
                            .timestamp(LocalDateTime.now())
                            .path(request.getRequestURI())
                            .build();
                    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                    log.warn("AUDITORÍA DE SEGURIDAD (403): Acceso denegado a {}", request.getRequestURI());
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}