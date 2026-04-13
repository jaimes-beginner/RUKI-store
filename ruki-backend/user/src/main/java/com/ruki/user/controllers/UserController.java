package com.ruki.user.controllers;

import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import com.ruki.user.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    /*
        Inyección de dependencia del servicio de 
        usuarios para realizar las operaciones 
        necesarias sobre los usuarios
    */
    private final UserService userService;

    /*
        Endpoint para crear un nuevo usuario, recibiendo 
        los datos necesarios en el cuerpo de la petición
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
        Endpoint para obtener un usuario por su ID
        recibiendo el ID como parámetro en la URL
    */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por id", description = "Retorna un usuario por su identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserResponse> getUserById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /*
        Endpoint para obtener un usuario por su correo 
        electrónicorecibiendo el email como parámetro en la URL
    */
    @GetMapping("/email/{email}")
    @Operation(summary = "Obtener usuario por email", description = "Retorna un usuario por su correo electronico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    /* Endpoint para obtener todos los usuarios activos, filtrando 
        por el estado isActive en true, retornando una lista de 
        usuarios que cumplen con esa condición
    */
    @GetMapping("/active")
    @Operation(summary = "Listar usuarios activos", description = "Retorna todos los usuarios con isActive en true")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<List<UserResponse>> getAllActiveUsers() {
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }

    /*
        Endpoint para panel de administrador
        retorna usuarios activos e inactivos
    */
    @GetMapping("/admin/all")
    @Operation(summary = "Listar todos los usuarios (Administrador RUKI)", description = "Retorna todos los usuarios para el panel de administrador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado para usuarios sin rol ADMIN")
    })
    public ResponseEntity<List<UserResponse>> getAllUsersForAdmin() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /*
        Endpoint para actualizar un usuario existente
        permitiendo la actualización parcial de los campos
        ya que todos son opcionales
    */
    @PutMapping("/update/{id}")
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
        Endpoint para eliminar un usuario realizando una baja 
        lógica, cambiando solo el estado del usuario a 
        inactivo, sin eliminar
    */
    @PutMapping("/delete/{id}")
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
        Endpoint para obtener los 
        datos del perfil autenticado
    */
    @GetMapping("/me")
    @Operation(summary = "Obtener mi perfil", description = "Retorna los datos del usuario autenticado leyendo su Token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
            @ApiResponse(responseCode = "401", description = "Token invalido, expirado o ausente")
    })
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String currentUserEmail = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(currentUserEmail));
    }

}