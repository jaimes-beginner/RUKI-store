package com.ruki.payment.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

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

@Component
@RequiredArgsConstructor
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

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        /* 
            Utilizamos la nueva validación estricta
        */
        if (jwtUtils.isTokenValid(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
            Claims claims = jwtUtils.extractAllClaims(jwt);
            Long userId = claims.get("userId", Long.class);

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            
            /* 
                Le decimos a Java que estamos seguros 
                del tipo de dato para quitar el warning 5
            */
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);

            if (roles != null && !roles.isEmpty()) {
                for (String roleName : roles) {
                    authorities.add(new SimpleGrantedAuthority(
                            roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName
                    ));
                }
            } else {
                String singleRole = claims.get("role", String.class);
                if (singleRole != null) {
                    authorities.add(new SimpleGrantedAuthority(
                            singleRole.startsWith("ROLE_") ? singleRole : "ROLE_" + singleRole
                    ));
                }
            }

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    authorities
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        filterChain.doFilter(request, response);
    }
}