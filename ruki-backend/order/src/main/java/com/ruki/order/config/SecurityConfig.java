package com.ruki.order.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruki.order.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/api-ruki/orders/**").permitAll()

                /* 
                    Aquí permitimos la solicitudes OPTIONS para que 
                    el frontend pueda hacer las preflight requests 
                    sin problemas de CORS
                */
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                /* 
                    Permitir acceso a Swagger UI y 
                    documentación sin autenticación
                */
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                /* 
                    Panel de administración de pedidos
                */
                .requestMatchers("/api-ruki/orders/admin/**").hasRole("ADMIN")
                
                /* 
                    Todos los demás endpoints requieren 
                    autenticación, pero no un rol específico
                */
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    
                    Map<String, Object> data = new HashMap<>();
                    data.put("timestamp", LocalDateTime.now().toString());
                    data.put("status", HttpServletResponse.SC_UNAUTHORIZED);
                    data.put("error", "Unauthorized");
                    data.put("message", "Token inválido o no proporcionado");
                    data.put("path", request.getRequestURI());
                    
                    response.getWriter().write(new ObjectMapper().writeValueAsString(data));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    
                    Map<String, Object> data = new HashMap<>();
                    data.put("timestamp", LocalDateTime.now().toString());
                    data.put("status", HttpServletResponse.SC_FORBIDDEN);
                    data.put("error", "Forbidden");
                    data.put("message", "Acceso denegado: Se requieren permisos superiores");
                    data.put("path", request.getRequestURI());
                    
                    System.out.println("ALERTA DE SEGURIDAD (403): Intento de acceso denegado a " + request.getRequestURI());
                    
                    response.getWriter().write(new ObjectMapper().writeValueAsString(data));
                })
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "*"));
        configuration.setAllowCredentials(true); 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
