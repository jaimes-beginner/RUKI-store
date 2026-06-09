package com.ruki.product.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ruki.product.exceptions.ApiErrorResponse; 
import com.ruki.product.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

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
            .cors(AbstractHttpConfigurer::disable) 
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                
                /*
                    Rutas públicas de Swagger UI
                */
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                /*
                    Rutas públicas de catálogo
                */
                .requestMatchers(HttpMethod.GET, "/api-ruki/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api-ruki/products/**").permitAll()

                /*
                    Rutas que requieren autenticación (cualquier usuario logueado)
                */
                .requestMatchers(HttpMethod.PUT, "/api-ruki/products/*/discount-stock", "/api-ruki/products/*/add-stock").authenticated()

                /*
                    Rutas de administración (solo ADMIN)
                */
                .requestMatchers(HttpMethod.POST, "/api-ruki/categories/create", "/api-ruki/products/create").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api-ruki/categories/update/**", "/api-ruki/products/update/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api-ruki/categories/delete/**", "/api-ruki/products/delete/**").hasRole("ADMIN")

                /*
                    Todas las demás rutas requieren autenticación
                */
                .anyRequest().authenticated() 
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiErrorResponse errorResponse = new ApiErrorResponse(
                            HttpStatus.UNAUTHORIZED.value(),
                            HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                            "No autorizado: " + authException.getMessage(),
                            LocalDateTime.now()
                    );
                    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    ApiErrorResponse errorResponse = new ApiErrorResponse(
                            HttpStatus.FORBIDDEN.value(),
                            HttpStatus.FORBIDDEN.getReasonPhrase(),
                            "Acceso denegado: No tienes permisos para este recurso.",
                            LocalDateTime.now()
                    );
                    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}