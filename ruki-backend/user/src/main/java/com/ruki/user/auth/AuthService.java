package com.ruki.user.auth;

import com.ruki.user.entities.User;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.security.JwtUtils;
import com.ruki.user.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    /* 
    Inyectamos el repositorio directo 
        en lugar del UserService
    */
    private final UserRepository userRepository;

    public AuthResponse login(AuthRequest request) {
        
        /* 
            Autenticación estándar de Spring Security
        */
        Authentication auth =authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        /*
            Cargamos los roles estándar
        */
            UserDetails userDetails = (UserDetails) auth.getPrincipal();

        /* 
            Bypass del guardia IDOR, aquí vamos 
            directo a la base de datos PRIMERO para 
            tener acceso al ID
        */
        var userEntity = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

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

    /*
        Método para solicitar la recuperación
    */
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Si el correo existe, se ha enviado un enlace de recuperación.")); 

        /*
            Generar token único de 36 caracteres
        */
        String token = UUID.randomUUID().toString();
        
        /*
            Guardar en BD con expiración de 15 minutos
        */
        user.setResetPasswordToken(token);
        user.setTokenExpirationDate(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        /*
            Enviar correo asíncrono
        */
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return "Correo de recuperación enviado con éxito.";
    }

    /*
        Método para guardar la nueva contraseña
    */
    public String resetPassword(String token, String newPassword) {
        
        /*
            Buscar usuario por el token
        */
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido o no encontrado."));

        /*
            Validar que no haya expirado
        */
        if (user.getTokenExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token de recuperación ha expirado. Solicita uno nuevo.");
        }

        /*
            Encriptar la nueva contraseña y limpiar los tokens de seguridad
        */
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setTokenExpirationDate(null);
        userRepository.save(user);

        /*
            Disparar la alerta de seguridad asíncrona
        */
        emailService.sendPasswordChangedNotification(user.getEmail());

        return "Contraseña actualizada exitosamente.";
    }

}