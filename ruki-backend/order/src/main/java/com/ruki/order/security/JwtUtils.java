package com.ruki.order.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException; 
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException; 
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; 
import jakarta.annotation.PostConstruct; 
import lombok.extern.slf4j.Slf4j; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration; 

    /*
        Este método se ejecuta justo después de JwtUtils
        se pone en marcha. Sirve para revisar que los secrets 
        esten configurados
    */
    @PostConstruct 
    public void validateSecret() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT_SECRET no fue configurado en application.properties.");
        }

        /*
            Revisamos que el secret sea lo suficientemente largo
            Si es muy corta, es más fácil de copiar por los falsificadores
        */
        if (secretKey.length() < 32) {
            log.warn("AUDITORÍA DE SEGURIDAD: La clave secreta JWT es demasiado corta ({} caracteres). Se recomienda al menos 32 caracteres para HS256.", secretKey.length());
        }
    }

    /*
        Obtiene la "llave" para firmar y verificar los tokens
    */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /*
        Extrae toda la información (claims) de un token
    */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /*
        Extrae el ID del usuario directamente desde el token
    */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /*
        Extrae el "nombre de usuario" (email) del token
    */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /*
        Extrae una pieza específica de información (claim) del "carnet"
    */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /*
        Verifica si un "carnet" (token) es válido
        Revisa si no está roto, si no ha caducado y si la firma es auténtica
    */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);

            String subject = claims.getSubject();
            Long userId = claims.get("userId", Long.class);
            List<?> roles = claims.get("roles", List.class);
            String role = claims.get("role", String.class);

            /*
                El "carnet" DEBE tener un nombre de usuario (subject) y un ID de 
                usuario, además, debe tener la lista de roles o al menos un rol singular
                Si falta algo de esto, el carnet no es válido
            */
            boolean isValid = subject != null && !subject.isEmpty()
                && userId != null
                && (roles != null && !roles.isEmpty() || role != null);

            /*
                También verificamos si el token ha expirado
            */
            return isValid && !isTokenExpired(token); 

        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            
            /*
                Si el token es falso, está roto, expiró o no es válido por alguna 
                razón, lo registramos como una advertencia
            */
            log.warn("AUDITORÍA DE JWT - Token rechazado: {}", e.getMessage());
            return false;
        } catch (Exception e) {

            /*
                Si ocurre cualquier otro problema inesperado al validar el 
                token, lo registramos como un error grave
            */
            log.error("AUDITORÍA DE JWT - Error inesperado al validar el token: {}", e.getMessage(), e);
            return false;
        }
    }

    /*
        Verifica si el token ha caducado
    */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /*
        Extrae la fecha de caducidad del token
    */
    private Date extractExpiration(String token) { 
        return extractClaim(token, Claims::getExpiration);
    }

    /*
        Genera un nuevo token para una persona
    */
    public String generateToken(Claims extraClaims, Long userId, String username, List<String> roles) { 
        extraClaims.put("userId", userId);
        extraClaims.put("roles", roles);
        if (!roles.isEmpty()) {
            extraClaims.put("role", roles.get(0));
        }

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

}