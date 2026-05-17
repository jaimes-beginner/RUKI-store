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
import java.math.RoundingMode;
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
        Método para crear una orden
    */
    @Override
    public Order createOrder(OrderCreate request, Long userId) {
        Order order = new Order();
        order.setUserId(userId); 
        order.setShippingAddressId(request.getShippingAddressId());
        order.setStatus(OrderStatus.PENDING);

        try {
            UserClientResponse user = userClient.getUserById(userId);
            order.setUserEmail(user.getEmail());
        } catch (Exception e) {
            log.warn("No se pudo obtener el correo en la creación de la orden.");
        }
        
        BigDecimal orderSubTotal = BigDecimal.ZERO;
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

                if (realProduct.getStock() < itemRequest.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Stock insuficiente para: '" + realProduct.getName() + "'. Quedan " + realProduct.getStock() + ".");
                }

                try {
                    productClient.discountStock(realProduct.getId(), itemRequest.getQuantity(), itemRequest.getSize());
                    processedItems.add(itemRequest);
                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Fallo al descontar inventario del producto: " + realProduct.getName() + " (Talla: " + itemRequest.getSize() + ")");
                }

                BigDecimal finalPrice = (realProduct.isSale() && realProduct.getSalePrice() != null) 
                                        ? realProduct.getSalePrice() 
                                        : realProduct.getBasePrice();

                BigDecimal itemSubTotal = finalPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
                orderSubTotal = orderSubTotal.add(itemSubTotal);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProductId(realProduct.getId());
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(finalPrice);
                orderItem.setSubTotal(itemSubTotal);
                orderItem.setSize(itemRequest.getSize()); 

                items.add(orderItem);
            }

            BigDecimal ivaRate = new BigDecimal("0.19");
            BigDecimal taxAmount = orderSubTotal.multiply(ivaRate).setScale(0, RoundingMode.HALF_UP);
            BigDecimal finalTotalAmount = orderSubTotal.add(taxAmount);

            order.setItems(items);
            order.setSubTotal(orderSubTotal);
            order.setTaxAmount(taxAmount);
            order.setTotalAmount(finalTotalAmount);

            return orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error creando el pedido. Iniciando Rollback de stock...");
            for (OrderItemRequest processedItem : processedItems) {
                try {
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
        Método para obtener una orden por su ID
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
        Método para obtener todas las órdenes de un usuario
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getMyOrders(Long currentUserId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
    }

    /*
        Método para cancelar una orden
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
        Método para obtener todas las órdenes (solo para administradores)
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersAdmin() {
        return orderRepository.findAll();
    }

    /*
        Método para actualizar el estado de una orden (solo para administradores)
    */
    @Override
    public Order updateOrderStatusAdmin(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        if (newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) {
            try {
                
                /*
                    Usamos el correo guardado en lugar de llamar a Feign
                */
                if (savedOrder.getUserEmail() != null) {
                    emailService.sendOrderStatusUpdate(savedOrder.getUserEmail(), savedOrder.getId(), newStatus.name());
                }
            } catch (Exception e) {
                log.error("Error al intentar enviar actualización logística.");
            }
        }

        log.info("AUDITORÍA ADMIN: El estado del pedido ID {} cambió a {}", orderId, newStatus);
        return savedOrder;
    }

    /*
        Método para actualizar el estado de una orden desde el servicio de pago
    */
    public Order updateStatusFromPayment(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden #" + orderId + " no encontrada"));
        
        order.setStatus(OrderStatus.valueOf(status));
        Order savedOrder = orderRepository.save(order);

        if (status.equals("PAID")) {
            try {
                
                /*
                    Usamos el correo guardado en lugar de llamar a Feign
                */
                if (savedOrder.getUserEmail() != null) {
                    emailService.sendOrderConfirmation(savedOrder.getUserEmail(), savedOrder.getId(), savedOrder.getTotalAmount());
                } else {
                    log.error("El pedido ID {} no tiene un correo asociado.", savedOrder.getId());
                }
            } catch (Exception e) {
                log.error("Error al enviar correo de confirmación: {}", e.getMessage());
            }
        }
        return savedOrder;
    }
}