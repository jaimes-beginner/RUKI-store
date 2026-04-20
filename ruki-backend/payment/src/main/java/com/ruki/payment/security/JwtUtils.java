package com.ruki.payment.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /* 
        Extrae el ID del usuario directamente desde el Token 
    */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /*
        Validación estricta 
    */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            
            String subject = claims.getSubject();
            Long userId = claims.get("userId", Long.class);
            List<?> roles = claims.get("roles", List.class);
            String role = claims.get("role", String.class);

            /* 
                El token DEBE tener subject y userId. Además, debe 
                tener la lista de roles o el rol fallback
            */
            return subject != null && !subject.isEmpty() 
                && userId != null 
                && (roles != null && !roles.isEmpty() || role != null);
                
        } catch (Exception e) {
            return false;
        }
    }
    
}