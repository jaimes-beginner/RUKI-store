package com.ruki.product.controllers;

import com.ruki.product.exceptions.ApiErrorResponse;
import com.ruki.product.requests.PageResponse;
import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import com.ruki.product.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content; 
import io.swagger.v3.oas.annotations.media.Schema; 
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min; 
import jakarta.validation.constraints.Positive; 
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.validation.annotation.Validated; 
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api-ruki/products")
@RequiredArgsConstructor
@Validated 
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
            @ApiResponse(responseCode = "400", description = "Datos inválidos o categoría inactiva", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreate request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // ENDPOINT PARA OBTENER LOS PRODUCTOS ACTIVOS CON PAGINACIÓN
    @GetMapping("/active")
    @Operation(summary = "Listar productos activos", description = "Retorna todos los productos visibles para el público paginados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    public ResponseEntity<PageResponse<ProductResponse>> getAllActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(productService.getAllActiveProducts(page, size));
    }

    /*
        Endpoint para listar productos por categoría
    */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Listar productos por categoría", description = "Retorna los productos activos de una categoría específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "400", description = "ID de categoría inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable @Positive Long categoryId) { 
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    /*
        Endpoint para obtener un producto por su ID
    */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto", description = "Busca un producto por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<ProductResponse> getProductById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /*
        Endpoint para eliminar/desactivar un producto
    */
    @PutMapping("/delete/{id}")
    @Operation(summary = "Eliminar producto", description = "Baja lógica de un producto (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto desactivado"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<Void> deactivateProduct(@PathVariable @Positive Long id) { 
        productService.deactivateProduct(id);
        return ResponseEntity.ok().build();
    }

    /*
        Endpoint para descontar stock de un producto
    */
    @PutMapping("/{id}/discount-stock")
    @Operation(summary = "Descontar stock", description = "Resta inventario al producto (Uso interno microservicios, requiere autenticación)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stock descontado"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente o producto inactivo", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> discountStock(
            @PathVariable @Positive Long id,
            @RequestParam @Min(value = 1, message = "La cantidad debe ser al menos 1") Integer quantity, 
            @RequestParam(required = false) String size) {
        productService.discountStock(id, quantity, size);
        return ResponseEntity.ok().build();
    }

    /*
        Endpoint para actualizar un producto
    */
    @PutMapping("/update/{id}")
    @Operation(summary = "Actualizar producto", description = "Actualiza parcialmente los campos de un producto (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto actualizado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o categoría inactiva", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto o categoría no encontrados", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable @Positive Long id, 
            @Valid @RequestBody ProductUpdate request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /*
        Endpoint agregar stock a un producto
    */
    @PutMapping("/{id}/add-stock")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Devolver stock", description = "Suma unidades al inventario (usado para rollbacks de pedidos fallidos, requiere autenticación)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stock devuelto"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<Void> addStock(
            @PathVariable @Positive Long id,
            @RequestParam @Min(value = 1, message = "La cantidad debe ser al menos 1") Integer quantity, 
            @RequestParam(required = false) String size) {
        productService.addStock(id, quantity, size);
        return ResponseEntity.ok().build();
    }

    // ENDPOINT PARA OBTENER LOS PRODUCTOS NUEVOS (NEW ARRIVALS)
    @GetMapping("/new-arrivals")
    @Operation(
        summary = "Obtener productos recientes (New Arrivals)",
        description = "Devuelve los últimos 12 productos activos ordenados por fecha de creación descendente y paginados. (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos recientes obtenida exitosamente")
    })
    public ResponseEntity<PageResponse<ProductResponse>> getNewArrivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(productService.getNewArrivals(page, size));
    }

    // ENDPOINT PARA OBTENER LOS PRODUCTOS EN OFERTA (SALE)
    @GetMapping("/sale")
    @Operation(
        summary = "Obtener productos en oferta (Sale)",
        description = "Devuelve todos los productos activos que tienen la bandera de oferta activada paginados. (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos en oferta obtenida exitosamente")
    })
    public ResponseEntity<PageResponse<ProductResponse>> getSaleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(productService.getSaleProducts(page, size));
    }

    /*
        Endpoint para filtrar productos dinámicamente por múltiples criterios
    */
    @GetMapping("/filter")
    @Operation(
        summary = "Filtrar productos dinámicamente",
        description = "Busca productos combinando múltiples filtros opcionales paginados (Categoría, Talla, Precio Mín/Máx, Orden). (Acceso Público)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de productos filtrada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Parámetros de filtro inválidos", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<PageResponse<ProductResponse>> filterProducts(
            @RequestParam(required = false) @Positive Long categoryId, 
            @RequestParam(required = false) String size,
            @RequestParam(required = false) @Positive BigDecimal minPrice, 
            @RequestParam(required = false) @Positive BigDecimal maxPrice, 
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int sizePage
    ) {
        return ResponseEntity.ok(productService.filterProducts(categoryId, size, minPrice, maxPrice, sort, page, sizePage));
    }
    
    /*
        Endpoint para que el jefe vea toda la bodega.
    */
    @GetMapping("/admin/all")
    @Operation(summary = "Listar todos los productos (ADMIN)", description = "Retorna el catálogo completo sin importar el estado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getAllProductsAdmin() {
        return ResponseEntity.ok(productService.getAllProductsAdmin());
    }

    /*
        Endpoint para que el jefe vuelva a poner a la venta un producto.
    */
    @PutMapping("/reactivate/{id}")
    @Operation(summary = "Reactivar producto", description = "Vuelve a activar un producto dado de baja (Requiere ROLE_ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto reactivado"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reactivateProduct(@PathVariable @Positive Long id) {
        productService.reactivateProduct(id);
        return ResponseEntity.ok().build();
    }

    // ENDPOINT PARA OBTENER LOS PRODUCTOS CON PAGINACIÓN PARA ADMINISTRADOR (INCLUYE INACTIVOS)
    @GetMapping("/admin/paged")
    @Operation(summary = "Listar productos paginados (ADMIN)", description = "Retorna el catálogo completo con paginación.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de ADMIN", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<ProductResponse>> getAdminProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int sizePage
    ) {
        return ResponseEntity.ok(productService.getAdminProductsPaged(page, sizePage));
    }

}