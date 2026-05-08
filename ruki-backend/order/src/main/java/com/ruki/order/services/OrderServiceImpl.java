package com.ruki.order.services;

import com.ruki.order.clients.ProductClient;
import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderItem;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.repositories.OrderRepository;
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.requests.OrderItemRequest;
import com.ruki.order.requests.ProductClientResponse;
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

    /* 
        Crear un nuevo pedido
    */
    @Override
    public Order createOrder(OrderCreate request, Long userId) {
        Order order = new Order();
        order.setUserId(userId); 
        order.setShippingAddressId(request.getShippingAddressId());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();
        
        /* 
            LLevaremos un registro de los productos que 
            ya descontamos en caso de que falle
        */
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

                /* 
                    Intentamos descontar el stock del producto
                */
                try {
                    productClient.discountStock(realProduct.getId(), itemRequest.getQuantity());
                    
                    /* 
                        Si tiene exito, lo registramos
                    */
                    processedItems.add(itemRequest);
                } catch (Exception e) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Fallo de conexión al descontar inventario.");
                }

                BigDecimal itemSubTotal = realProduct.getBasePrice().multiply(new BigDecimal(itemRequest.getQuantity()));
                totalAmount = totalAmount.add(itemSubTotal);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProductId(realProduct.getId());
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(realProduct.getBasePrice());
                orderItem.setSubTotal(itemSubTotal);

                items.add(orderItem);
            }

            order.setItems(items);
            order.setTotalAmount(totalAmount);

            return orderRepository.save(order);

        } catch (Exception e) {
            /* 
                Si algo sale mal en el proceso, hacemos 
                rollback de los stocks descontados
            */
            log.error("Error creando el pedido. Iniciando Rollback de stock...");
            for (OrderItemRequest processedItem : processedItems) {
                try {
                    productClient.addStock(processedItem.getProductId(), processedItem.getQuantity());
                    log.info("Rollback exitoso: Devueltas {} unidades al producto {}", processedItem.getQuantity(), processedItem.getProductId());
                } catch (Exception rollbackEx) {
                    log.error("ALERTA CRÍTICA: Falló el rollback para el producto {}", processedItem.getProductId());
                }
            }
            
            /* 
                Volvemos a lanzar la excepción original 
                para que el Frontend se entere del error
            */
            throw e;
        }
    }

    /* 
        Obtener un pedido por su ID
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
        Obtener los pedidos de un usuario
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getMyOrders(Long currentUserId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
    }

    /* 
        Cancelar un pedido (solo si no está entregado o ya cancelado)
    */
    @Override
    public Order cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin) {
        
        Order order = getOrderById(orderId, currentUserId, isAdmin);
        
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cancelar un pedido en estado " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        log.info("AUDITORÍA: El usuario con ID {} CANCELÓ el pedido ID {}", currentUserId, orderId);

        return orderRepository.save(order);
    }

    /* 
        Para el administrador: Obtener todos los pedidos
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersAdmin() {
        return orderRepository.findAll();
    }

    /* 
        Para el administrador: Cambiar el estado de un pedido
    */
    @Override
    public Order updateOrderStatusAdmin(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        
        order.setStatus(newStatus);
        log.info("AUDITORÍA ADMIN: El estado del pedido ID {} cambió a {}", orderId, newStatus);

        return orderRepository.save(order);
    }

    /* 
        Actualizar el estado de un pedido 
    */
    public Order updateStatusFromPayment(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden #" + orderId + " no encontrada"));

        order.setStatus(OrderStatus.valueOf(status));
        return orderRepository.save(order);
    }

}