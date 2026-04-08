package com.ruki.user.controllers;

import com.ruki.user.requests.AddressCreate;
import com.ruki.user.requests.AddressResponse;
import com.ruki.user.requests.AddressUpdate;
import com.ruki.user.services.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api-ruki/addresses")
@Tag(name = "Addresses", description = "Operaciones CRUD del modulo de direcciones")
public class AddressController {

    private final AddressService addressService;

    /*
        Endpoint para crear una nueva dirección
        recibe un DTO con los datos necesarios
    */
    @PostMapping("/create")
    @Operation(summary = "Crear direccion", description = "Agrega una nueva direccion a un usuario existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Direccion creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos invalidos o usuario no encontrado")
    })
    public ResponseEntity<AddressResponse> createAddress(@Valid @RequestBody AddressCreate addressCreate) {
        return ResponseEntity.ok(addressService.createAddress(addressCreate));
    }

    /*
        Endpoint para obtener todas las direcciones asociadas a 
        un usuario recibe el ID del usuario como parámetro de ruta
    */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtener direcciones de un usuario", description = "Retorna todas las direcciones asociadas a un ID de usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de direcciones obtenida"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<List<AddressResponse>> getAddressesByUser(@PathVariable @Positive Long userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    /*
        Endpoint para panel de administrador
        retorna todas las direcciones registradas
    */
    @GetMapping("/admin/all")
    @Operation(summary = "Listar todas las direcciones (Admin)", description = "Retorna todas las direcciones para el panel de administrador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de direcciones obtenida"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado para usuarios sin rol ADMIN")
    })
    public ResponseEntity<List<AddressResponse>> getAllAddressesForAdmin() {
        return ResponseEntity.ok(addressService.getAllAddresses());
    }

    /*
        Endpoint para actualizar una dirección por su ID
        permite actualizar de forma parcial los campos enviados
    */
    @PutMapping("/update/{addressId}")
    @Operation(summary = "Actualizar direccion", description = "Actualiza parcialmente una direccion existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Direccion actualizada correctamente"),
            @ApiResponse(responseCode = "404", description = "Direccion no encontrada")
    })
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable @Positive Long addressId,
            @Valid @RequestBody AddressUpdate addressUpdate
    ) {
        return ResponseEntity.ok(addressService.updateAddress(addressId, addressUpdate));
    }

    /*
        Endpoint para eliminar una dirección por su ID
    */
    @DeleteMapping("/delete/{addressId}")
    @Operation(summary = "Eliminar direccion", description = "Elimina una direccion existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Direccion eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Direccion no encontrada")
    })
    public ResponseEntity<Void> deleteAddress(@PathVariable @Positive Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }
    
}