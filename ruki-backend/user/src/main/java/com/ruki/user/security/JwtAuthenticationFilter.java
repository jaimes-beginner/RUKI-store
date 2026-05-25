package com.ruki.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Importar Slf4j
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j 
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

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
            userEmail = jwtUtils.extractUsername(jwt);

            /*
                En caso de que el token tenga un correo y el usuario no está ya autenticado
            */
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                /*
                    Validamos que el token no sea falso ni esté expirado y que el usuario esté habilitado
                */
                if (jwtUtils.isTokenValid(jwt, userDetails) && userDetails.isEnabled()) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    /*
                        Le avisamos a Spring Security que el usuario pasó la prueba
                    */
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Usuario autenticado con éxito: {}", userEmail);
                } else {
                    log.warn("Token JWT inválido o usuario deshabilitado para: {}", userEmail);
                }
            }
        } catch (Exception e) {
            
            /*
                Si el token es inválido, está mal formado o expiró, atrapamos el error 
                y no autenticamos al usuario. El GlobalExceptionHandler manejará el 401
            */
            log.warn("Error procesando el token JWT: {}", e.getMessage());
            
            /*
                No es necesario enviar un error aquí, el SecurityConfig.authenticationEntryPoint 
                lo hará si es necesario
            */
        }

        filterChain.doFilter(request, response);
    }
    
}