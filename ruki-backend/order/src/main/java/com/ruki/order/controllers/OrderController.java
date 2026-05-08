package com.ruki.order.controllers;

import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
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
        Endpoint para crear un nuevo pedido 
    */
    @PostMapping("/create")
    @SecurityRequirement(name = "bearerAuth") 
    @Operation(summary = "Crear un nuevo pedido", description = "Genera la orden de compra. El ID del usuario se extrae de forma segura desde el contexto de Spring Security.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o sin stock"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
    })
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderCreate request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.createOrder(request, userId));
    }

    /* 
        Endpoint para ver un pedido específico (Implementando Anti-IDOR) 
    */
    @GetMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth") 
    @Operation(summary = "Ver detalle de un pedido", description = "Busca una boleta. Protegido por Anti-IDOR: Solo el dueño o un ADMIN pueden verlo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
            @ApiResponse(responseCode = "401", description = "Token inválido"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (No te pertenece)"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    })
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(orderService.getOrderById(id, currentUserId, isAdmin));
    }

    /* 
        Endpoint para ver el historial de mis pedidos 
    */
    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth") 
    @Operation(summary = "Ver mis pedidos", description = "Retorna el historial de compras del usuario autenticado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historial obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token ausente o inválido")
    })
    public ResponseEntity<List<Order>> getMyOrders() {
        Long currentUserId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(orderService.getMyOrders(currentUserId));
    }

    /* 
        Endpoint para cancelar un pedido (con el recién implementando Anti-IDOR) 
    */
    @PatchMapping("/me/{id}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancelar un pedido", description = "Cambia el estado del pedido a CANCELED. Protegido por Anti-IDOR.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido cancelado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (No te pertenece)"),
            @ApiResponse(responseCode = "409", description = "El pedido ya fue enviado o cancelado")
    })
    public ResponseEntity<Order> cancelMyOrder(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = (Long) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        return ResponseEntity.ok(orderService.cancelMyOrder(id, currentUserId, isAdmin));
    }


    /* 
        Endpoint para que el administrador vea todas las órdenes del sistema
    */
    @GetMapping("/admin/all")
    @SecurityRequirement(name = "bearerAuth") 
    @Operation(summary = "Listar todos los pedidos (ADMIN)", description = "Retorna todas las boletas del sistema. Requiere rol ROLE_ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador")
    })
    public ResponseEntity<List<Order>> getAllOrdersAdmin() {
        return ResponseEntity.ok(orderService.getAllOrdersAdmin());
    }

    /* 
        Endpoint para que el administrador actualice el estado de un pedido
    */
    @PatchMapping("/admin/{id}/status")
    @SecurityRequirement(name = "bearerAuth") 
    @Operation(summary = "Cambiar estado de pedido (ADMIN)", description = "Actualiza el estado de envío/preparación. Requiere rol ROLE_ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos de Administrador"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    })
    public ResponseEntity<Order> updateOrderStatusAdmin(
            @PathVariable Long id, 
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatusAdmin(id, status));
    }

    /* 
        Endpoint para actualizar el estado de un pedido (S2S)
    */
    @PutMapping("/{id}/status")
    @Operation(summary = "Actualizar estado (S2S)", description = "Webhook interno para que el microservicio de Pagos cambie el estado a PAID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    })
    public ResponseEntity<Order> updateStatusFromPayment(
            @PathVariable Long id, 
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatusFromPayment(id, status));
    }

}