package com.ruki.user.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ruki.user.requests.ForgotPasswordRequest;
import com.ruki.user.requests.ResetPasswordRequest;

@RestController
@RequestMapping("/api-ruki/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints para inicio de sesión y seguridad")
public class AuthController {

    private final AuthService authService;

    /* 
        Endpoint original de Login 
    */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y retorna un token JWT válido por 24 horas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso, retorna el JWT y datos del usuario"),
            @ApiResponse(responseCode = "400", description = "Datos de petición inválidos (ej. campos vacíos)"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /* 
        Endpoint para pedir la recuperación de clave 
    */
    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña", description = "Genera un token de 15 minutos y envía un enlace de recuperación al correo si este existe en el sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Correo de recuperación enviado (Retorna éxito incluso si el correo no existe por seguridad Anti-Enumeración)"),
            @ApiResponse(responseCode = "400", description = "Formato de correo inválido o ausente")
    })
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    /* 
        Endpoint para guardar la nueva clave 
    */
    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Recibe el token de recuperación extraído de la URL y la nueva contraseña para actualizarla en la base de datos.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos incompletos en el body"),
            @ApiResponse(responseCode = "500", description = "Token inválido o expirado (Internal Server Error controlado)")
    })
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request.getToken(), request.getNewPassword()));
    }

}