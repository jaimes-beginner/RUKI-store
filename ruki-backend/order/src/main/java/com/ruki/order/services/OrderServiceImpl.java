package com.ruki.order.services;

import com.ruki.order.clients.ProductClient;
import com.ruki.order.clients.UserClient;
import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderItem;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.repositories.OrderRepository;
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.requests.OrderItemRequest;
import com.ruki.order.requests.ProductClientResponse;
import com.ruki.order.requests.UserClientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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
        Lógica para crear una orden
    */
    @Override
    public Order createOrder(OrderCreate request, Long userId) {
        Order order = new Order();
        order.setUserId(userId); 
        order.setShippingAddressId(request.getShippingAddressId());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();
        List<OrderItemRequest> processedItems = new ArrayList<>();

        try {
            for (OrderItemRequest itemRequest : request.getItems()) {
                
                ProductClientResponse realProduct;
                try {
                    realProduct = productClient.getProductById(itemRequest.getProductId());
                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "El producto con ID " + itemRequest.getProductId() + " no existe.");
                }

                if (!realProduct.isActive()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "El producto '" + realProduct.getName() + "' ya no está disponible.");
                }

                /*
                    Chequeo global preliminar
                */
                if (realProduct.getStock() < itemRequest.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Stock insuficiente para: '" + realProduct.getName() + "'. Quedan " + realProduct.getStock() + ".");
                }

                /*
                    Logica del descuento según la talla
                */
                try {
                    productClient.discountStock(realProduct.getId(), itemRequest.getQuantity(), itemRequest.getSize());
                    processedItems.add(itemRequest);
                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Fallo al descontar inventario del producto: " + realProduct.getName() + " (Talla: " + itemRequest.getSize() + ")");
                }

                /*
                    Lógica de los precios para saber si están en oferta o no 
                */
                BigDecimal finalPrice = (realProduct.isSale() && realProduct.getSalePrice() != null) 
                                        ? realProduct.getSalePrice() 
                                        : realProduct.getBasePrice();

                BigDecimal itemSubTotal = finalPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
                totalAmount = totalAmount.add(itemSubTotal);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProductId(realProduct.getId());
                orderItem.setQuantity(itemRequest.getQuantity());

                /*
                    Cobramos el precio correcto
                */
                orderItem.setUnitPrice(finalPrice);
                orderItem.setSubTotal(itemSubTotal);

                /*
                    Guardamos la talla para el envío
                */
                orderItem.setSize(itemRequest.getSize()); 

                items.add(orderItem);
            }

            order.setItems(items);
            order.setTotalAmount(totalAmount);

            return orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error creando el pedido. Iniciando Rollback de stock...");
            for (OrderItemRequest processedItem : processedItems) {
                try {

                    /*
                        Rollback en donde devolvemos a la talla específica
                    */
                    productClient.addStock(processedItem.getProductId(), processedItem.getQuantity(), processedItem.getSize());
                    log.info("Rollback exitoso: Devueltas {} unidades al producto {} (Talla: {})", 
                            processedItem.getQuantity(), processedItem.getProductId(), processedItem.getSize());
                } catch (Exception rollbackEx) {
                    log.error("ALERTA CRÍTICA: Falló el rollback para el producto {}", processedItem.getProductId());
                }
            }
            throw e;
        }
    }

    /*
        Lógica para obtener una orden por su ID
    */
    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId, Long currentUserId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        if (!isAdmin && !order.getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Este pedido no te pertenece");
        }
        return order;
    }

    /*
        Lógica para obtener mis pedidos
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getMyOrders(Long currentUserId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
    }

    /*
        Lógica para cancelar un pedido
    */
    @Override
    public Order cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin) {
        Order order = getOrderById(orderId, currentUserId, isAdmin);
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cancelar un pedido en estado " + order.getStatus());
        }
        
        for (OrderItem item : order.getItems()) {
            productClient.addStock(item.getProductId(), item.getQuantity(), item.getSize());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        log.info("AUDITORÍA: El usuario con ID {} CANCELÓ el pedido ID {}", currentUserId, orderId);
        return orderRepository.save(order);
    }

    /*
        Lógica para obtener todas las ordenes (solo admin)
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersAdmin() {
        return orderRepository.findAll();
    }

    /*
        Lógica para actualizar el estado de un pedido (solo admin)
    */
    @Override
    public Order updateOrderStatusAdmin(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        /*
            Disparar correo si el Admin lo marca como ENVIADO o ENTREGADO
        */
        if (newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) {
            try {
                UserClientResponse user = userClient.getUserById(savedOrder.getUserId());
                emailService.sendOrderStatusUpdate(user.getEmail(), savedOrder.getId(), newStatus.name());
            } catch (Exception e) {
                log.error("No se pudo obtener el correo del usuario ID {} para enviar actualización.", savedOrder.getUserId());
            }
        }

        log.info("AUDITORÍA ADMIN: El estado del pedido ID {} cambió a {}", orderId, newStatus);
        return savedOrder;
    }

    /*
        Lógica para actualizar el estado de de pago de un pedido
    */
    public Order updateStatusFromPayment(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden #" + orderId + " no encontrada"));
        
        order.setStatus(OrderStatus.valueOf(status));
        Order savedOrder = orderRepository.save(order);

        /*
            Si el pago fue exitoso (PAID), mandamos el correo electrónico
        */
        if (status.equals("PAID")) {
            
            try {
                /*
                    Llamamos al microservicio de usuarios
                */
                UserClientResponse user = userClient.getUserById(savedOrder.getUserId());
                
                /*
                    Le mandamos el correo a su email real
                */
                emailService.sendOrderConfirmation(user.getEmail(), savedOrder.getId(), savedOrder.getTotalAmount());
            } catch (Exception e) {
                log.error("No se pudo obtener el correo del usuario ID {} para enviar la confirmación.", savedOrder.getUserId());
            }

        }

        return savedOrder;
    }
    
    
}