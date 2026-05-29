package com.ruki.product.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException; 
import io.jsonwebtoken.MalformedJwtException; 
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException; 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; 
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors; 

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        /*
            Si no hay token o no empieza con 'Bearer ', el filtro simplemente ignora
        */
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
            Extraemos el token quitando la primera palabra 'Bearer '
        */
        String extractedToken = authHeader.substring(7).trim();

        /*
            Si por error viene "Bearer Bearer eyJ..." lo limpiamos
        */
        if (extractedToken.toLowerCase().startsWith("bearer ")) {
            extractedToken = extractedToken.substring(7).trim();
            log.warn("Se detectó un Bearer doble en el token, limpiado automáticamente.");
        }

        jwt = extractedToken;

        try {
            
            /*
                alidamos el token y si el usuario no está ya autenticado
            */
            if (jwtUtils.isTokenValid(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                userEmail = jwtUtils.extractUsername(jwt);
                Claims claims = jwtUtils.extractAllClaims(jwt);

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                /*
                    Preferimos el claim "roles" (lista) si existe
                */
                @SuppressWarnings("unchecked")
                List<String> rolesFromClaims = claims.get("roles", List.class);

                if (rolesFromClaims != null && !rolesFromClaims.isEmpty()) {
                    authorities.addAll(rolesFromClaims.stream()
                            .map(roleName -> roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                } else {
                    
                    /*
                        Si no hay "roles" (lista), intentamos con el claim "role" (singular)
                    */
                    String singleRole = claims.get("role", String.class);
                    if (singleRole != null) {
                        authorities.add(new SimpleGrantedAuthority(
                                singleRole.startsWith("ROLE_") ? singleRole : "ROLE_" + singleRole
                        ));
                    } else {
                        
                        /*
                            Si no hay roles definidos, asignamos un rol por defecto (ej. CUSTOMER)
                        */
                        log.warn("Token JWT para usuario {} no contiene roles. Asignando ROLE_CUSTOMER por defecto.", userEmail);
                        authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
                    }
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail,
                        null,      
                        authorities 
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("Usuario autenticado con éxito: {}", userEmail);
            }
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {

            /*
                Captura excepciones específicas de JWT para un log más claro
            */
            log.warn("AUDITORÍA DE SEGURIDAD - Token JWT inválido o expirado: {}", e.getMessage());
            
            /*
                No es necesario enviar un error aquí, el SecurityConfig.authenticationEntryPoint lo hará si es necesario
            */
        } catch (Exception e) {
            
            /*
                Captura cualquier otra excepción inesperada
            */
            log.error("AUDITORÍA DE SEGURIDAD - Error inesperado al procesar el Token JWT: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
    
}