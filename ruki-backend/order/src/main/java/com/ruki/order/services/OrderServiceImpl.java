package com.ruki.order.services;

import com.ruki.order.clients.ProductClient;
import com.ruki.order.clients.UserClient;
import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderItem;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.exceptions.ForbiddenOperationException;
import com.ruki.order.exceptions.ResourceConflictException;
import com.ruki.order.exceptions.ResourceNotFoundException;
import com.ruki.order.repositories.OrderRepository;
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.requests.OrderItemRequest;
import com.ruki.order.requests.OrderResponse;
import com.ruki.order.requests.PageResponse;
import com.ruki.order.requests.ProductClientResponse;
import com.ruki.order.requests.UserClientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/*
     Este es el "encargado de pedidos" de tu tienda.
     Recibe las "listas de compras" de los clientes y se encarga
     de todo el proceso: verificar productos, descontar stock,
     calcular precios, guardar la orden y enviar notificaciones.
     También maneja los problemas si algo sale mal.
*/
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient; 
    private final EmailService emailService;  
    private final UserClient userClient;      

    /*
         Método para crear una orden de compra online.
         Recibe la "lista de compras" y el ID del cliente.
    */
    @Override
    public OrderResponse createOrder(OrderCreate request, Long userId) {

        /*
             Si es una compra online, la dirección de envío es obligatoria.
        */
        if (request.getShippingAddressId() == null) {
            throw new ResourceConflictException("Debes seleccionar una dirección de envío para compras online.");
        }

        Order order = Order.builder()
                .userId(userId)
                .shippingAddressId(request.getShippingAddressId())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .subTotal(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        /*
             Intentamos obtener el correo del usuario para futuras notificaciones.
             Si falla, lo registramos pero no detenemos la creación del pedido.
        */
        try {
            UserClientResponse user = userClient.getUserById(userId);
            order.setUserEmail(user.getEmail());
        } catch (Exception e) {
            log.warn("ORDER | No se pudo obtener el correo del usuario {} en la creación de la orden: {}", userId, e.getMessage());
            /*
                 Podríamos asignar un email por defecto o dejarlo null y manejarlo
                 en el servicio de email. Por ahora, lo dejamos null si falla.
            */
        }

        BigDecimal orderSubTotal = BigDecimal.ZERO;
        List<OrderItemRequest> processedItems = new ArrayList<>(); /* Para el rollback */

        try {
            for (OrderItemRequest itemRequest : request.getItems()) {

                ProductClientResponse realProduct;
                try {
                    /*
                         Pedimos información del producto al microservicio de productos.
                    */
                    realProduct = productClient.getProductById(itemRequest.getProductId());
                } catch (Exception e) {
                    /*
                         Si el producto no existe o hay un error al consultarlo,
                         lanzamos una excepción clara.
                    */
                    log.warn("ORDER | Producto con ID {} no encontrado o error al consultar: {}", itemRequest.getProductId(), e.getMessage());
                    throw new ResourceNotFoundException("El producto con ID " + itemRequest.getProductId() + " no existe.");
                }

                /*
                     Verificamos si el producto está activo.
                */
                if (!realProduct.isActive()) {
                    log.warn("ORDER | Intento de comprar producto inactivo: {} (ID: {})", realProduct.getName(), realProduct.getId());
                    throw new ResourceConflictException("El producto '" + realProduct.getName() + "' ya no está disponible.");
                }

                /*
                     Verificamos si hay suficiente stock.
                */
                if (realProduct.getStock() < itemRequest.getQuantity()) {
                    log.warn("ORDER | Stock insuficiente para producto {} (ID: {}). Solicitado: {}, Disponible: {}", realProduct.getName(), realProduct.getId(), itemRequest.getQuantity(), realProduct.getStock());
                    throw new ResourceConflictException("Stock insuficiente para: '" + realProduct.getName() + "'. Quedan " + realProduct.getStock() + ".");
                }

                /*
                    Descontamos el stock del microservicio de productos.
                    Si esto falla, debemos hacer un rollback de todo.
                */
                try {
                    productClient.discountStock(realProduct.getId(), itemRequest.getQuantity(), itemRequest.getSize());
                    processedItems.add(itemRequest);
                } catch (Exception e) {
                    log.error("ORDER | Fallo al descontar inventario del producto {} (ID: {}, Talla: {}): {}", realProduct.getName(), realProduct.getId(), itemRequest.getSize(), e.getMessage(), e);
                    throw new ResourceConflictException("Fallo al descontar inventario del producto: " + realProduct.getName() + " (Talla: " + itemRequest.getSize() + ")");
                }

                /*
                     Calculamos el precio final del ítem (considerando ofertas).
                */
                BigDecimal finalPrice = (realProduct.isSale() && realProduct.getSalePrice() != null)
                                        ? realProduct.getSalePrice()
                                        : realProduct.getBasePrice();

                BigDecimal itemSubTotal = finalPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
                orderSubTotal = orderSubTotal.add(itemSubTotal);

                /*
                     Creamos el ítem de la orden y lo añadimos a la lista.
                */
                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .productId(realProduct.getId())
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(finalPrice)
                        .subTotal(itemSubTotal)
                        .size(itemRequest.getSize())
                        .build();
                order.getItems().add(orderItem);
            }

            /*
                 Calculamos impuestos y el monto total de la orden.
            */
            BigDecimal ivaRate = new BigDecimal("0.19");
            BigDecimal taxAmount = orderSubTotal.multiply(ivaRate).setScale(0, RoundingMode.HALF_UP);
            BigDecimal finalTotalAmount = orderSubTotal.add(taxAmount);

            order.setSubTotal(orderSubTotal);
            order.setTaxAmount(taxAmount);
            order.setTotalAmount(finalTotalAmount);

            Order savedOrder = orderRepository.save(order);
            log.info("ORDER | Pedido #{} creado exitosamente para el usuario {}. Total: {}", savedOrder.getId(), userId, savedOrder.getTotalAmount());
            return toResponse(savedOrder); /* Devolver DTO */

        } catch (Exception e) {
            /*
                 Si algo falla durante la creación del pedido,
                 hacemos un "rollback" del stock que ya habíamos descontado.
            */
            log.error("ORDER | Error creando el pedido para usuario {}. Iniciando Rollback de stock...", userId, e);
            for (OrderItemRequest processedItem : processedItems) {
                try {
                    /* Pasamos los datos directamente sin el DTO */
                    productClient.addStock(processedItem.getProductId(), processedItem.getQuantity(), processedItem.getSize());
                    log.info("ORDER | Rollback exitoso: Devueltas {} unidades al producto {} (Talla: {})",
                            processedItem.getQuantity(), processedItem.getProductId(), processedItem.getSize());
                } catch (Exception rollbackEx) {
                    log.error("ORDER | ALERTA CRÍTICA: Falló el rollback para el producto {} (Talla: {}). Se requiere intervención manual.", processedItem.getProductId(), processedItem.getSize(), rollbackEx);
                }
            }
            throw e; /* Relanzar la excepción original */
        }
    }

    /*
         Método para crear una orden de compra física en tienda (solo para administradores).
         Es similar a createOrder, pero con algunas diferencias (sin dirección de envío, estado DELIVERED).
    */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse createPhysicalOrder(OrderCreate request, Long adminId) {
        Order order = Order.builder()
                .userId(adminId)
                .shippingAddressId(null)
                .status(OrderStatus.DELIVERED) 
                .items(new ArrayList<>()) 
                .subTotal(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        /*
             Intentamos obtener el correo del administrador que procesó la venta.
        */
        try {
            UserClientResponse adminUser = userClient.getUserById(adminId);
            order.setUserEmail(adminUser.getEmail());
        } catch (Exception e) {
            log.warn("ORDER | Venta Física: No se pudo obtener el correo del admin {}. Asignando email por defecto.", adminId, e);
            order.setUserEmail("tienda-fisica@ruki.com"); /* Email por defecto si falla */
        }

        BigDecimal orderSubTotal = BigDecimal.ZERO;
        List<OrderItemRequest> processedItems = new ArrayList<>();

        try {
            for (OrderItemRequest itemRequest : request.getItems()) {
                ProductClientResponse realProduct;
                try {
                    realProduct = productClient.getProductById(itemRequest.getProductId());
                } catch (Exception e) {
                    log.warn("ORDER | Venta Física: Producto con ID {} no encontrado o error al consultar: {}", itemRequest.getProductId(), e.getMessage());
                    throw new ResourceNotFoundException("El producto con ID " + itemRequest.getProductId() + " no existe.");
                }

                if (!realProduct.isActive()) {
                    log.warn("ORDER | Venta Física: Intento de vender producto inactivo: {} (ID: {})", realProduct.getName(), realProduct.getId());
                    throw new ResourceConflictException("El producto '" + realProduct.getName() + "' ya no está disponible.");
                }

                if (realProduct.getStock() < itemRequest.getQuantity()) {
                    log.warn("ORDER | Venta Física: Stock insuficiente para producto {} (ID: {}). Solicitado: {}, Disponible: {}", realProduct.getName(), realProduct.getId(), itemRequest.getQuantity(), realProduct.getStock());
                    throw new ResourceConflictException("Stock insuficiente para: '" + realProduct.getName() + "'.");
                }

                /*
                    Descontamos inventario en tiempo real
                */
                try {
                    productClient.discountStock(realProduct.getId(), itemRequest.getQuantity(), itemRequest.getSize());
                    processedItems.add(itemRequest);
                } catch (Exception e) {
                    log.error("ORDER | Venta Física: Fallo al descontar stock de producto {} (ID: {}, Talla: {}): {}", realProduct.getName(), realProduct.getId(), itemRequest.getSize(), e.getMessage(), e);
                    throw new ResourceConflictException("Fallo al descontar stock de: " + realProduct.getName());
                }

                BigDecimal finalPrice = (realProduct.isSale() && realProduct.getSalePrice() != null)
                                        ? realProduct.getSalePrice()
                                        : realProduct.getBasePrice();

                BigDecimal itemSubTotal = finalPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
                orderSubTotal = orderSubTotal.add(itemSubTotal);

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .productId(realProduct.getId())
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(finalPrice)
                        .subTotal(itemSubTotal)
                        .size(itemRequest.getSize())
                        .build();
                order.getItems().add(orderItem);
            }

            BigDecimal ivaRate = new BigDecimal("0.19");
            BigDecimal taxAmount = orderSubTotal.multiply(ivaRate).setScale(0, RoundingMode.HALF_UP);
            BigDecimal finalTotalAmount = orderSubTotal.add(taxAmount);

            order.setSubTotal(orderSubTotal);
            order.setTaxAmount(taxAmount);
            order.setTotalAmount(finalTotalAmount);

            Order savedOrder = orderRepository.save(order);

            /*
                 Si el pedido tiene un email válido (no el de tienda-fisica@ruki.com),
                 enviamos una confirmación.
            */
            if (savedOrder.getUserEmail() != null && !"tienda-fisica@ruki.com".equals(savedOrder.getUserEmail())) {
                 emailService.sendOrderConfirmation(savedOrder.getUserEmail(), savedOrder.getId(), savedOrder.getTotalAmount());
            }

            log.info("ORDER | VENTA FÍSICA: Registrada con éxito. Pedido #{} cobrado por Admin {}", savedOrder.getId(), adminId);
            return toResponse(savedOrder);

        } catch (Exception e) {
            log.error("ORDER | ERROR CRÍTICO: Fallo en Venta Física para Admin {}. Iniciando Rollback de stock...", adminId, e);
            for (OrderItemRequest processedItem : processedItems) {
                try {

                    /* 
                        Pasamos los datos directamente sin el DTO 
                    */
                    productClient.addStock(processedItem.getProductId(), processedItem.getQuantity(), processedItem.getSize());
                    log.info("ORDER | Rollback exitoso: Devueltas {} unidades al producto {} (Talla: {})",
                            processedItem.getQuantity(), processedItem.getProductId(), processedItem.getSize());
                } catch (Exception rollbackEx) {
                    log.error("ORDER | ALERTA CRÍTICA: Falló el rollback para el producto {} (Talla: {}). Se requiere intervención manual.", processedItem.getProductId(), processedItem.getSize(), rollbackEx);
                }
            }
            throw e;
        }
    }

    /*
         Método para obtener una orden por su ID.
         Solo el dueño o un administrador pueden verla (Anti-IDOR).
    */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public OrderResponse getOrderById(Long orderId, Long currentUserId, boolean isAdmin) {
        // --- CORRECCIÓN AQUÍ: Obtener la entidad Order directamente del repositorio ---
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + orderId));

        /*
             Si no es administrador y el pedido no es del usuario actual,
             se deniega el acceso.
        */
        if (!isAdmin && !order.getUserId().equals(currentUserId)) {
            log.warn("ORDER | Acceso denegado: Usuario {} intentó ver pedido {} de otro usuario {}.", currentUserId, orderId, order.getUserId());
            throw new ForbiddenOperationException("Acceso denegado: Este pedido no te pertenece.");
        }
        log.debug("ORDER | Pedido #{} encontrado para el usuario {}.", orderId, currentUserId);
        return toResponse(order);
    }

    // MÉTODO PARRA OBTENER ÓRDENES PAGINADAS DE UN USUARIO AUTENTICADO
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public PageResponse<OrderResponse> getMyOrders(Long currentUserId, String status, Long orderId, int page, int size) {
        
        // CONVERTIMOS EL TEXTO DEL ESTADO A ENUM, SI ESTÁ VACÍO ENTONCES LO DEJAMOS NULO
        OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("TODOS")) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResourceConflictException("Estado de filtro inválido.");
            }
        }

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findMyOrdersFiltered(currentUserId, orderStatus, orderId, pageRequest);
        List<OrderResponse> content = orderPage.getContent().stream().map(this::toResponse).toList();
                
        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    /*
        Método para cancelar un pedido.
        Solo el dueño o un administrador pueden cancelarlo.
        Si el pedido ya fue entregado o cancelado, no se puede.
    */
    @Override
    public OrderResponse cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + orderId));

        /*
            Si no es administrador y el el pedido no es del usuario actual,
            se deniega el acceso.
        */
        if (!isAdmin && !order.getUserId().equals(currentUserId)) {
            log.warn("ORDER | Acceso denegado: Usuario {} intentó cancelar pedido {} de otro usuario {}.", currentUserId, orderId, order.getUserId());
            throw new ForbiddenOperationException("Acceso denegado: Este pedido no te pertenece.");
        }

        /*
             No se puede cancelar si ya está entregado o cancelado.
        */
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            log.warn("ORDER | Intento de cancelar pedido #{} en estado {}. No permitido.", orderId, order.getStatus());
            throw new ResourceConflictException("No se puede cancelar un pedido en estado " + order.getStatus() + ".");
        }

        /*
             Devolvemos el stock de los productos al microservicio de productos.
        */
        for (OrderItem item : order.getItems()) {
            try {
                /* 
                    Pasamos los datos directamente sin el DTO 
                */
                productClient.addStock(item.getProductId(), item.getQuantity(), item.getSize());
                log.info("ORDER | Stock devuelto: {} unidades al producto {} (Talla: {}) por cancelación del pedido #{}",
                        item.getQuantity(), item.getProductId(), item.getSize(), orderId
                );
            } catch (Exception e) {
                log.error("ORDER | ALERTA CRÍTICA: Falló la devolución de stock para el producto {} (Talla: {}) al cancelar pedido #{}. Se requiere intervención manual.", item.getProductId(), item.getSize(), orderId, e);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        log.info("ORDER | AUDITORÍA: El usuario con ID {} CANCELÓ el pedido ID {}", currentUserId, orderId);

        /*
             Enviamos notificación de cancelación.
        */
        if (savedOrder.getUserEmail() != null) {
            emailService.sendOrderStatusUpdate(savedOrder.getUserEmail(), savedOrder.getId(), OrderStatus.CANCELLED.name());
        }
        return toResponse(savedOrder);
    }

    // MÉTODO PARA OBTENER TODOS LOS PEDIDOS (ADMINISTRADOR)
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> getAllOrdersAdmin() {
        log.debug("ORDER | Obteniendo todos los pedidos para el administrador.");
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
         Método para que el administrador actualice el estado de un pedido.
    */
    @Override
    public OrderResponse updateOrderStatusAdmin(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + orderId));

        /*
             Si el estado es CANCELLED, debemos devolver el stock.
             Si el estado es DELIVERED, no se puede cambiar a un estado anterior.
        */
        if (order.getStatus() == OrderStatus.DELIVERED && newStatus != OrderStatus.DELIVERED) {
            log.warn("ORDER | Intento de cambiar estado de pedido #{} (DELIVERED) a {}. No permitido.", orderId, newStatus);
            throw new ResourceConflictException("No se puede cambiar el estado de un pedido ya entregado a un estado anterior.");
        }

        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            /*
                 Si el admin cancela, devolvemos el stock.
                 Esto es similar a cancelMyOrder, pero iniciado por el admin.
            */
            for (OrderItem item : order.getItems()) {
                try {
                    /* Pasamos los datos directamente sin el DTO */
                    productClient.addStock(item.getProductId(), item.getQuantity(), item.getSize());
                    log.info("ORDER | Stock devuelto por ADMIN: {} unidades al producto {} (Talla: {}) por cancelación del pedido #{}",
                            item.getQuantity(), item.getProductId(), item.getSize(), orderId);
                } catch (Exception e) {
                    log.error("ORDER | ALERTA CRÍTICA: Falló la devolución de stock para el producto {} (Talla: {}) al cancelar pedido #{} por ADMIN. Se requiere intervención manual.", item.getProductId(), item.getSize(), orderId, e);
                }
            }
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        /*
             Enviamos notificación de actualización de estado si es relevante.
        */
        if (savedOrder.getUserEmail() != null && (newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED)) {
            emailService.sendOrderStatusUpdate(savedOrder.getUserEmail(), savedOrder.getId(), newStatus.name());
        }

        log.info("ORDER | AUDITORÍA ADMIN: El estado del pedido ID {} cambió a {}", orderId, newStatus);
        return toResponse(savedOrder);
    }

    /*
         Método para actualizar el estado de una orden desde el servicio de pago (Webhook).
         No requiere autenticación, ya que es una comunicación entre servidores.
    */
    @Override
    public OrderResponse updateStatusFromPayment(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden #" + orderId + " no encontrada."));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("ORDER | Webhook de Pago: Estado '{}' inválido para el pedido #{}.", status, orderId);
            throw new ResourceConflictException("Estado de pago inválido: " + status);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        /*
             Si el estado es PAID, enviamos un correo de confirmación.
        */
        if (newStatus == OrderStatus.PAID) {
            try {
                if (savedOrder.getUserEmail() != null) {
                    emailService.sendOrderConfirmation(savedOrder.getUserEmail(), savedOrder.getId(), savedOrder.getTotalAmount());
                    log.info("ORDER | Correo de confirmación de pago enviado para pedido #{} a {}.", savedOrder.getId(), savedOrder.getUserEmail());
                } else {
                    log.error("ORDER | El pedido ID {} no tiene un correo asociado. No se pudo enviar confirmación de pago.", savedOrder.getId());
                }
            } catch (Exception e) {
                log.error("ORDER | Error al enviar correo de confirmación de pago para pedido #{}: {}", savedOrder.getId(), e.getMessage(), e);
            }
        }
        log.info("ORDER | Webhook de Pago: El estado del pedido ID {} cambió a {}.", orderId, newStatus);
        return toResponse(savedOrder);
    }

    // MÉTODO PARA OBTENER ÓRDENES PAGINADAS PARA EL ADMINISTRADOR
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<OrderResponse> getAllOrdersAdminPaged(int page, int size) {
        log.debug("ORDER | Obteniendo todos los pedidos paginados para el administrador.");
        
        // ORDENAMOS POR ID DESCENDENTE PARA VER LOS PEDIDOS MÁS RECIENTES PRIMERO
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Order> orderPage = orderRepository.findAll(pageRequest);
        
        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toResponse)
                .toList();
                
        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    // MÉTODO ASINCRONO, TOMA EL ID DE LA ORDEN ABANDONADA Y DEVUELVE EL 
    // STOCK DE LOS PRODUCTOS A LA BODEGA VIA FEIGN Y LA MARCA COMO CANCELADA
    @Override
    @Async
    @Transactional
    public void rollbackAbandonedOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        
        if (order == null || order.getStatus() != OrderStatus.PENDING) {
            return; 
        }

        log.info("CRON JOB | Cancelando pedido abandonado #{}", orderId);

        for (OrderItem item : order.getItems()) {
            try {
                productClient.addStock(item.getProductId(), item.getQuantity(), item.getSize());
                log.debug("CRON JOB | Stock devuelto: {} unidades del producto {} (Talla: {})", 
                        item.getQuantity(), item.getProductId(), item.getSize());
            } catch (Exception e) {
                log.error("CRON JOB | ALERTA: Falló la devolución de stock para el producto {} al cancelar pedido abandonado #{}. Requiere revisión manual.", 
                        item.getProductId(), orderId, e);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    /*
        Método auxiliar para convertir una entidad Order a un OrderResponse.
    */
    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subTotal(item.getSubTotal())
                        .size(item.getSize())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .shippingAddressId(order.getShippingAddressId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .subTotal(order.getSubTotal())
                .taxAmount(order.getTaxAmount())
                .userEmail(order.getUserEmail())
                .build();
    }
}