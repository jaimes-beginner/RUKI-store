package com.ruki.product.controllers;

import com.ruki.product.exceptions.ApiErrorResponse; 
import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import com.ruki.product.services.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content; 
import io.swagger.v3.oas.annotations.media.Schema; 
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api-ruki/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Operaciones CRUD para el catálogo de categorías")
public class CategoryController {

    private final CategoryService categoryService;

    /*
        Endpoint para crear una categoría
    */
    @PostMapping("/create")
    @Operation(summary = "Crear categoría", description = "Agrega una nueva categoría (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría creada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "La categoría ya existe", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryCreate request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    /*
        Endpoint para listar categorías activas
    */
    @GetMapping("/active")
    @Operation(summary = "Listar categorías activas", description = "Retorna todas las categorías visibles para el público")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<List<CategoryResponse>> getAllActiveCategories() {
        return ResponseEntity.ok(categoryService.getAllActiveCategories());
    }

    /*
        Endpoint para obtener una categoría por ID
    */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría", description = "Busca una categoría por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    /*
        Endpoint para eliminar (desactivar) una categoría
    */
    @PutMapping("/delete/{id}")
    @Operation(summary = "Eliminar categoría", description = "Baja lógica de una categoría (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría desactivada"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<Void> deactivateCategory(@PathVariable Long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok().build();
    }

    /*
        Endpoint para actualizar una categoría
    */
    @PutMapping("/update/{id}")
    @Operation(summary = "Actualizar categoría", description = "Actualiza el nombre de una categoría (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría actualizada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "El nombre de categoría ya existe", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryCreate request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

}