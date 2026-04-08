package com.ruki.user.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api-ruki/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints para inicio de sesión y seguridad")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y retorna un token JWT válido por 24 horas")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}