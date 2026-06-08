package com.ruki.order.controllers;

import com.ruki.order.entities.OrderStatus;
import com.ruki.order.exceptions.ApiErrorResponse; 
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.requests.OrderResponse;
import com.ruki.order.requests.PageResponse;
import com.ruki.order.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content; 
import io.swagger.v3.oas.annotations.media.Schema; 
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive; 
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api-ruki/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Operaciones para la gestión de compras y carritos")
public class OrderController {

    private final OrderService orderService;

    /*
        Endpoint para crear un pedido
    */
    @PostMapping("/create")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear un nuevo pedido", description = "Genera la orden de compra. El ID del usuario se extrae de forma segura desde el contexto de Spring Security.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido creado exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o sin stock", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreate request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(orderService.createOrder(request, userId));
    }

    /*
        Endpoint para crear una venta física
    */
    @PostMapping("/physical")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Crear venta física (POS)", description = "Genera una orden cobrada y entregada automáticamente en tienda. Solo administradores.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Venta física creada exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o sin stock", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<OrderResponse> createPhysicalOrder(@Valid @RequestBody OrderCreate request) {
        Long adminId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        OrderResponse newOrder = orderService.createPhysicalOrder(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(newOrder);
    }

    /*
        Endpoint para obtener el detalle de un pedido (Anti-IDOR)
    */
    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Ver detalle de un pedido", description = "Busca una boleta. Protegido por Anti-IDOR: Solo el dueño o un ADMIN pueden verlo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido encontrado", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (No te pertenece)", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable @Positive Long id) { 
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(id, currentUserId, isAdmin));
    }

    // ENDPOINT PARA OBTENER EL HISTORIAL DE COMPRAS DEL USUARIO AUTENTICADO
    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Ver mis pedidos", description = "Retorna el historial de compras con paginación del usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historial obtenido exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<PageResponse<OrderResponse>> getMyOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        Long currentUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(orderService.getMyOrders(currentUserId, status, orderId, page, size));
    }

    /*
        Endpoint para cancelar un pedido (Anti-IDOR)
    */
    @PutMapping("/me/{id}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancelar un pedido", description = "Cambia el estado del pedido a CANCELED. Protegido por Anti-IDOR.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido cancelado exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (No te pertenece)", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "El pedido ya fue enviado o cancelado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> cancelMyOrder(@PathVariable @Positive Long id) { 
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.cancelMyOrder(id, currentUserId, isAdmin));
    }

    // ENDPOINT PARA OBTENER TODAS LAS ORDENES (ADMIN)
    @GetMapping("/admin/all")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar todos los pedidos (ADMIN)", description = "Retorna todas las boletas del sistema. Requiere rol ROLE_ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<List<OrderResponse>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderService.getAllOrdersAdmin());

    }

    // ENDPOINT PARA OBTENER TODAS LAS ORDENES (ADMIN)
    @GetMapping("/admin/paged")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar todos los pedidos (ADMIN)", description = "Retorna todas las boletas del sistema paginados. Requiere rol ROLE_ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrdersAdminPaged(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "9") int size
    ){
        return ResponseEntity.ok(orderService.getAllOrdersAdminPaged(page, size));
    }

    /*
        Endpoint para que un ADMIN cambie el estado de una orden (sin Anti-IDOR)
    */
    @PutMapping("/admin/{id}/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cambiar estado de pedido (ADMIN)", description = "Actualiza el estado de envío/preparación. Requiere rol ROLE_ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Estado inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<OrderResponse> updateOrderStatusAdmin(
            @PathVariable @Positive Long id, 
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatusAdmin(id, status));
    }

    /*
        Endpoint para actualizar el estado de un pedido
    */
    @PutMapping("/{id}/status")
    @Operation(summary = "Actualizar estado (S2S)", description = "Webhook interno para que el microservicio de Pagos cambie el estado a PAID. No requiere autenticación.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente", content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Estado inválido", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<OrderResponse> updateStatusFromPayment(
            @PathVariable @Positive Long id, 
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatusFromPayment(id, status));
    }

}