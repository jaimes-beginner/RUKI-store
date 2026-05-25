package com.ruki.user.auth;

import com.ruki.user.exceptions.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
        Endpoint para iniciar sesión
    */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y retorna un token JWT válido por 24 horas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso, retorna el JWT y datos del usuario"),
            @ApiResponse(responseCode = "400", description = "Datos de petición inválidos (ej. campos vacíos)", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /*
        Endpoint para solicitar recuperación de contraseña
        Por seguridad anti-enumeración, siempre retornamos 200 OK, incluso si el correo no 
        existe, así el mensaje de éxito es genérico para no dar pistas sobre la existencia de usuarios
    */
    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña", description = "Genera un token de 15 minutos y envía un enlace de recuperación al correo si este existe en el sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Correo de recuperación enviado (Retorna éxito incluso si el correo no existe por seguridad Anti-Enumeración)"),
            @ApiResponse(responseCode = "400", description = "Formato de correo inválido o ausente", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Si el correo existe, se ha enviado un enlace de recuperación.");
    }

    /*
        Endpoint para restablecer contraseña
    */
    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Recibe el token de recuperación extraído de la URL y la nueva contraseña para actualizarla en la base de datos.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos incompletos en el body o token inválido/expirado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Token no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada exitosamente.");
    }
    
}