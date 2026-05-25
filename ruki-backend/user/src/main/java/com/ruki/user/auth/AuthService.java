package com.ruki.user.auth;

import com.ruki.user.entities.User;
import com.ruki.user.exceptions.ResourceConflictException;
import com.ruki.user.exceptions.ResourceNotFoundException;
import com.ruki.user.exceptions.UnauthorizedException;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.security.JwtUtils;
import com.ruki.user.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j 
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService; 
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository; 

    @Transactional 
    public AuthResponse login(AuthRequest request) {
        try {
            
            /*
                Autenticación estándar de Spring Security
            */
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            /*
                Cargamos los roles estándar
            */
            UserDetails userDetails = (UserDetails) auth.getPrincipal();

            /*
                Bypass del guardia IDOR, aquí vamos directo a la base de datos primero para tener acceso 
                al ID, luego se busca por email y que esté activo para evitar login de usuarios inactivos
            */
            User userEntity = userRepository.findByEmailAndIsActiveTrue(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado o inactivo."));

            /*
                Preparamos los claims adicionales inyectando el ID del usuario
            */
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", userEntity.getId());

            /*
                Generamos el token pasándole los claims adicionales y los roles
            */
            String token = jwtUtils.generateToken(extraClaims, userDetails);

            /*
                Mapeamos la respuesta final usando el Builder de AuthResponse
            */
            UserResponse userResponse = UserResponse.builder()
                    .id(userEntity.getId())
                    .email(userEntity.getEmail())
                    .firstName(userEntity.getFirstName())
                    .lastName(userEntity.getLastName())
                    .role(userEntity.getRole())
                    .createdAt(userEntity.getCreatedAt())
                    .build();

            return AuthResponse.builder()
                    .token(token)
                    .user(userResponse)
                    .build();

        } catch (BadCredentialsException ex) {
            
            /*
                Captura específicamente credenciales incorrectas para un mensaje más claro
            */
            throw new UnauthorizedException("Credenciales incorrectas.");
        } catch (ResourceNotFoundException ex) {
            
            /*
                Re-lanza ResourceNotFoundException para que el GlobalExceptionHandler la maneje
            */
            throw ex;
        } catch (Exception ex) {
            
            /*
                Captura cualquier otra excepción inesperada durante el login
            */
            log.error("Error inesperado durante el login para el email {}: {}", request.getEmail(), ex.getMessage(), ex);
            throw new RuntimeException("Error al intentar iniciar sesión.");
        }
    }

    /*
        Método para solicitar recuperación de contraseña
    */
    @Transactional
    public void forgotPassword(String email) {

        /*
            Por seguridad anti-enumeración, no lanzamos el ResourceNotFoundException
            por aquí, si el usuario no existe, simplemente no hacemos nada o lo logueamos
        */
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setTokenExpirationDate(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Token de recuperación generado y correo enviado para el email: {}", email);
        }, () -> {
            log.warn("Solicitud de recuperación de contraseña para email no existente: {}", email);
            throw new ResourceNotFoundException("Si el correo existe, se ha enviado un enlace de recuperación.");
        });
    }

    /*
        Método para restablecer la constraseña
    */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token inválido o no encontrado."));

        if (user.getTokenExpirationDate() == null || user.getTokenExpirationDate().isBefore(LocalDateTime.now())) {
            throw new ResourceConflictException("El token de recuperación ha expirado. Solicita uno nuevo.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setTokenExpirationDate(null);
        userRepository.save(user);

        emailService.sendPasswordChangedNotification(user.getEmail());
        log.info("Contraseña actualizada para el usuario con token: {}", token);
    }
}