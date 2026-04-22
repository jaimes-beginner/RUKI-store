package com.ruki.user.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
        
        /* 
            Esto imprimirá en la consola qué está recibiendo realmente
        */
        System.out.println("TOKEN RECIBIDO EN EL HEADER: " + authHeader);

        final String jwt;
        final String userEmail;

        /*
            Aquí si no hay token o no empieza con 'Bearer ' el guardia 
            simplemente ignora y la petición fallará por seguridad
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
            System.out.println("Se detectó un Bearer doble, token limpiado automáticamente.");
        }
        
        jwt = extractedToken;

        try {
            userEmail = jwtUtils.extractUsername(jwt);

            /* 
                En caso de que el token tenga un correo 
                y el usuario no está ya autenticado 
            */
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                /*
                    Validamos que el token no sea 
                    falso ni esté expirado
                */
                if (jwtUtils.isTokenValid(jwt, userDetails) && userDetails.isEnabled()) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    /* 
                        Le avisamos a Spring Security 
                        que el usuario pasó la prueba
                    */
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Usuario autenticado con éxito: " + userEmail);
                }
            }
        } catch (Exception e) {
            /* 
                Si el token es inválido, está mal formado o 
                expiró, atrapamos el error para que no explote el servidor
            */
            System.out.println("Error procesando el token JWT: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

}