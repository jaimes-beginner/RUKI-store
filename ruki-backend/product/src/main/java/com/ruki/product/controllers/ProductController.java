package com.ruki.product.controllers;

import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import com.ruki.product.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; // <-- Importación añadida
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api-ruki/products")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Operaciones CRUD para el catálogo de productos")
public class ProductController {

    private final ProductService productService;

    /* 
        Endpoint para crear un producto
    */
    @PostMapping("/create")
    @Operation(summary = "Crear producto", description = "Agrega un nuevo producto al catálogo (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o categoría inactiva"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreate request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    /* 
        Endpoint para listar productos activos
    */
    @GetMapping("/active")
    @Operation(summary = "Listar productos activos", description = "Retorna todos los productos visibles para el público")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<List<ProductResponse>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    /* 
        Endpoint para listar productos por categoría
    */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Listar productos por categoría", description = "Retorna los productos activos de una categoría específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    /* 
        Endpoint para obtener un producto por su ID
    */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto", description = "Busca un producto por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /* 
        Endpoint para eliminar un producto (baja lógica)
    */
    @PutMapping("/delete/{id}")
    @Operation(summary = "Eliminar producto", description = "Baja lógica de un producto (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth") 
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto desactivado"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.ok().build();
    }
    
    /* 
        Endpoint para descontar stock de un producto
    */
    @PutMapping("/{id}/discount-stock")
    @Operation(summary = "Descontar stock", description = "Resta inventario al producto (Uso interno microservicios)")
    @SecurityRequirement(name = "bearerAuth") 
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stock descontado"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente o producto inactivo"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<Void> discountStock(@PathVariable Long id, @RequestParam Integer quantity) {
        productService.discountStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    /* 
        Endpoint para actualizar un producto existente
    */
    @PutMapping("/update/{id}")
    @Operation(summary = "Actualizar producto", description = "Actualiza parcialmente los campos de un producto (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto actualizado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o categoría inactiva"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN"),
            @ApiResponse(responseCode = "404", description = "Producto o categoría no encontrados")
    })
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductUpdate request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /* 
        Endpoint para agregar stock a un producto (Rollback de compras fallidas)
    */
    @PutMapping("/{id}/add-stock")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Devolver stock", description = "Suma unidades al inventario (usado para rollbacks de pedidos fallidos)")
    public ResponseEntity<Void> addStock(@PathVariable Long id, @RequestParam Integer quantity) {
        productService.addStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    /*
        Endpoint para obtener los productos recientes 
        para usarlos en los ARRIVALS
    */
    @GetMapping("/new-arrivals")
    @Operation(
        summary = "Obtener productos recientes (New Arrivals)", 
        description = "Devuelve los últimos 12 productos activos ordenados por fecha de creación descendente. (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos recientes obtenida exitosamente")
    })
    public ResponseEntity<List<ProductResponse>> getNewArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    /*
        Endpoint para obtener los productos en oferta 
        para usarlos en los SALE
    */
    @GetMapping("/sale")
    @Operation(
        summary = "Obtener productos en oferta (Sale)", 
        description = "Devuelve todos los productos activos que tienen la bandera de oferta activada. (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos en oferta obtenida exitosamente")
    })
    public ResponseEntity<List<ProductResponse>> getSaleProducts() {
        return ResponseEntity.ok(productService.getSaleProducts());
    }

    /*
        Endpoint para obtener los productos filtrados dinamicamente 
        según los parámetros de búsqueda, para usarlos en la búsqueda 
        avanzada del catálogo
    */
    @GetMapping("/filter")
    @Operation(
        summary = "Filtrar productos dinámicamente", 
        description = "Busca productos combinando múltiples filtros opcionales (Categoría, Talla, Precio Mín/Máx, Orden). (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos filtrada exitosamente")
    })
    public ResponseEntity<List<ProductResponse>> filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        
        return ResponseEntity.ok(productService.filterProducts(categoryId, size, minPrice, maxPrice, sort));
    }

}