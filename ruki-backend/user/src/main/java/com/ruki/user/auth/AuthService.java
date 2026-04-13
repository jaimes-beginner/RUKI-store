package com.ruki.user.auth;

import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    
    /* 
    Inyectamos el repositorio directo 
        en lugar del UserService
    */
    private final UserRepository userRepository;

    public AuthResponse login(AuthRequest request) {
        
        /* 
            Autenticación estándar de Spring Security
        */
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        /* 
            Bypass del guardia IDOR, aquí vamos 
            directo a la base de datos PRIMERO para 
            tener acceso al ID
        */
        var userEntity = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        /*
            Cargamos los roles estándar
        */
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        
        /* 
            Preparamos los claims adicionales 
            inyectando el ID del usuario
        */
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", userEntity.getId());

        /* 
            Generamos el token pasándole los 
            claims adicionales y los roles
        */
        String token = jwtUtils.generateToken(extraClaims, userDetails);

        /*
            Mapeamos la respuesta final
        */
        UserResponse userResponse = new UserResponse();
        userResponse.setId(userEntity.getId());
        userResponse.setEmail(userEntity.getEmail());
        userResponse.setFirstName(userEntity.getFirstName());
        userResponse.setLastName(userEntity.getLastName());
        userResponse.setRole(userEntity.getRole());
        userResponse.setCreatedAt(userEntity.getCreatedAt());

        return new AuthResponse(token, userResponse);
    }

}