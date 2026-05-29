package com.ruki.product.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException; 
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException; 
import io.jsonwebtoken.UnsupportedJwtException; 
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; 
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @PostConstruct
    public void validateSecret() {

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT_SECRET no fue configurado en application.properties.");
        }
        
        /*
            Validar longitud mínima de la clave secreta para seguridad
        */
        if (secretKey.length() < 32) { 
            log.warn("La clave secreta JWT es demasiado corta ({} caracteres). Se recomienda al menos 32 caracteres para HS256.", secretKey.length());
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            
            /*
                Loguear la razón específica del fallo del token
            */
            log.warn("AUDITORÍA DE JWT - Token rechazado: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            
            /*
                Capturar cualquier otra excepción inesperada
            */
            log.error("AUDITORÍA DE JWT - Error inesperado al validar el token: {}", e.getMessage(), e);
            return false;
        }
    }

}