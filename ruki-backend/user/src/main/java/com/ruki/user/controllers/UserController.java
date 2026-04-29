package com.ruki.user.controllers;

import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import com.ruki.user.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api-ruki/users")
@Tag(name = "Users", description = "Operaciones CRUD del modulo de usuarios")
public class UserController {

    private final UserService userService;

    /* 
        Endpoint para crear un usuario
    */
    @PostMapping("/create")
    @Operation(summary = "Crear usuario", description = "Registra un nuevo usuario en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos o correo ya en uso")
    })
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreate userCreate) {
        return ResponseEntity.ok(userService.createUser(userCreate));
    }

    /* 
        Endpoint para obtener un usuario por su id
    */
    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtener usuario por id", description = "Retorna un usuario por su identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserResponse> getUserById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /* 
        Endpoint para obtener un usuario por su email
    */
    @GetMapping("/email/{email}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtener usuario por email", description = "Retorna un usuario por su correo electronico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    /* 
        Endpoint para obtener todos los usuarios activos (isActive = true)
    */
    @GetMapping("/active")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar usuarios activos", description = "Retorna todos los usuarios con isActive en true")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<List<UserResponse>> getAllActiveUsers() {
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }

    /* 
        Endpoint para obtener todos los usuarios (solo para administradores)
    */
    @GetMapping("/admin/all")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar todos los usuarios (Administrador RUKI)", description = "Retorna todos los usuarios para el panel de administrador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado para usuarios sin rol ADMIN")
    })
    public ResponseEntity<List<UserResponse>> getAllUsersForAdmin() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /* 
        Endpoint para actualizar un usuario
    */
    @PutMapping("/update/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Actualizar usuario", description = "Actualiza parcialmente los campos del usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: No eres el propietario del recurso"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserResponse> updateUser(@PathVariable @Positive Long id, @Valid @RequestBody UserUpdate userUpdate) {
        return ResponseEntity.ok(userService.updateUser(id, userUpdate));
    }

    /* 
        Endpoint para eliminar un usuario
    */
    @PutMapping("/delete/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Eliminar usuario", description = "Realiza una baja logica del usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario desactivado correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: No eres el propietario del recurso"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable @Positive Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    /* 
        Endpoint para obtener el perfil del usuario autenticado
    */
    @GetMapping("/me")
    @Operation(summary = "Obtener mi perfil", description = "Retorna los datos del usuario autenticado leyendo su Token JWT")
    @SecurityRequirement(name = "bearerAuth") 
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
            @ApiResponse(responseCode = "401", description = "Token invalido, expirado o ausente")
    })
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String currentUserEmail = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(currentUserEmail));
    }

    /* 
        Endpoint para reactivar un usuario
    */
    @PutMapping("/reactivate/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Reactivar usuario", description = "Vuelve a activar a un usuario que fue dado de baja previamente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario reactivado correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: No eres el propietario del recurso o no eres ADMIN"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Void> reactivateUser(@PathVariable @Positive Long id) {
        userService.reactivateUser(id);
        return ResponseEntity.ok().build();
    }

}