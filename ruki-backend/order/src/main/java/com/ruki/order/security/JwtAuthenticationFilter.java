package com.ruki.order.security;

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
import org.springframework.lang.NonNull;
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

@Component
@RequiredArgsConstructor
@Slf4j 
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        /*
            Si no hay un "carnet" (token) o no empieza con "Bearer ",
            simplemente dejamos que la petición siga su camino.
            Spring Security se encargará de decir que no está autorizado más adelante
        */
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
            Extraemos el "carnet" (token) quitando la palabra "Bearer "
        */
        String extractedToken = authHeader.substring(7).trim();

        /*
            Si por error el token viene con "Bearer Bearer ...", lo limpiamos
        */
        if (extractedToken.toLowerCase().startsWith("bearer ")) {
            extractedToken = extractedToken.substring(7).trim();
            log.warn("AUDITORÍA DE SEGURIDAD: Se detectó un 'Bearer' doble en el token JWT. Limpiado automáticamente.");
        }

        jwt = extractedToken;

        try {

            /*
                Validamos el "carnet" (token) y comprobamos que la persona
                no esté ya "dentro" (autenticada en Spring Security)
            */
            if (jwtUtils.isTokenValid(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                /*
                    Sacamos la información de la persona del "carnet" (claims del token)
                    Aquí obtenemos el ID del usuario y sus roles
                */
                Claims claims = jwtUtils.extractAllClaims(jwt);
                Long userId = claims.get("userId", Long.class);

                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                /*
                    Preferimos la lista de roles si viene en el token
                    Si no, buscamos un solo rol
                    Si no hay ninguno, no asignamos nada (el acceso se denegará por defecto)
                */
                @SuppressWarnings("unchecked")
                List<String> rolesFromClaims = claims.get("roles", List.class);

                if (rolesFromClaims != null && !rolesFromClaims.isEmpty()) {
                    authorities.addAll(rolesFromClaims.stream()
                            .map(roleName -> roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                } else {
                    String singleRole = claims.get("role", String.class);
                    if (singleRole != null) {
                        authorities.add(new SimpleGrantedAuthority(
                                singleRole.startsWith("ROLE_") ? singleRole : "ROLE_" + singleRole
                        ));
                    } else {

                        /*
                            Si el token no tiene roles, lo logueamos como advertencia
                            Esto podría ser un token mal formado o un usuario sin roles
                        */
                        log.warn("AUDITORÍA DE SEGURIDAD: Token JWT para usuario con ID {} no contiene roles. El acceso podría ser denegado.", userId);
                    }
                }

                /*
                    Le decimos a Spring Security que esta persona es válida
                    Le damos su ID, y sus "permisos" (roles)
                */
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,         // El ID del usuario es el "principal" (quién es)
                        null,           // No necesitamos credenciales aquí, ya validamos el token
                        authorities     // Los permisos que tiene
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                /*
                    Le decimos a Spring Security que esta petición
                    está autenticada
                */
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("AUDITORÍA DE SEGURIDAD: Usuario con ID {} autenticado con éxito.", userId);
            }
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            
            /*
                Si el "carnet" (token) es falso, está roto, expiró o no es válido por alguna 
                razón, atrapamos el error. No autenticamos a la persona
                El GlobalExceptionHandler se encargará de dar una respuesta 401
            */
            log.warn("AUDITORÍA DE SEGURIDAD: Token JWT inválido o expirado para la petición a {}: {}", request.getRequestURI(), e.getMessage());
        } catch (Exception e) {
            
            /*
                Si ocurre cualquier otro problema inesperado al revisar 
                el "carnet", lo registramos como un error grave
            */
            log.error("AUDITORÍA DE SEGURIDAD: Error inesperado al procesar el Token JWT para la petición a {}: {}", request.getRequestURI(), e.getMessage(), e);
        }

        /*
            Dejamos que la petición siga su camino, ya sea autenticada o no
        */
        filterChain.doFilter(request, response);
    }

}