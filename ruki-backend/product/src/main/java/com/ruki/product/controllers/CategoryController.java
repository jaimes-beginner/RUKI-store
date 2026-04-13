package com.ruki.product.controllers;

import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import com.ruki.product.services.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api-ruki/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Operaciones CRUD para el catálogo de categorías")
public class CategoryController {

    private final CategoryService categoryService;

    /*
        Endpoint para crear una categoria
    */
    @PostMapping("/create")
    @Operation(summary = "Crear categoría", description = "Agrega una nueva categoría (Requiere ROLE_ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría creada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN"),
            @ApiResponse(responseCode = "409", description = "La categoría ya existe")
    })
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
        Endpoint para obtener una categoría por su ID
    */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría", description = "Busca una categoría por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    /* 
        Endpoint para eliminar una categoría (baja lógica)
    */
    @PutMapping("/delete/{id}")
    @Operation(summary = "Eliminar categoría", description = "Baja lógica de una categoría (Requiere ROLE_ADMIN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categoría desactivada"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    public ResponseEntity<Void> deactivateCategory(@PathVariable Long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok().build();
    }
    
}