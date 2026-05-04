package com.ruki.payment.config;

import com.ruki.payment.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/api-ruki/payments/checkout", "/api-ruki/payments/process").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                /* 
                    Transbank no tiene JWT, esta 
                    ruta debe ser pública
                */
                .requestMatchers(HttpMethod.GET, "/api-ruki/payments/callback").permitAll()
                
                /* 
                    Las rutas de Swagger
                */
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                /* 
                    El resto (como /create) requiere 
                    que el usuario esté logueado si o si
                */
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

}