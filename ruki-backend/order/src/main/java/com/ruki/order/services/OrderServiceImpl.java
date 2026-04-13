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
        Crear un pedido/orden de compra 
    */
    @Override
    public Order createOrder(OrderCreate request, Long userId) {
        
        Order order = new Order();
        order.setUserId(userId); // ¡Adiós al ID quemado a mano!
        order.setShippingAddressId(request.getShippingAddressId());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

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

            BigDecimal itemSubTotal = realProduct.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemSubTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(realProduct.getId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(realProduct.getPrice());
            orderItem.setSubTotal(itemSubTotal);

            items.add(orderItem);
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    /*
        Obtener una orden por ID, con validación de ownership
    */
    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId, Long currentUserId, boolean isAdmin) {
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));

        /* 
            Aquí entra la validación ownership, o sea si 
            no eres admin y el pedido no es tuyo, entonces 
            mandamos un 403 Forbidden
        */
        if (!isAdmin && !order.getUserId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Este pedido no te pertenece");
        }

        return order;
    }

    /* 
        Ver el historial completo de mis pedidos 
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getMyOrders(Long currentUserId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
    }

    /* 
        Cancelar un pedido (esta vez protegido por Anti-IDOR) 
    */
    @Override
    public Order cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin) {
        
        /* 
            Reutilizamos el método que ya tiene el escudo Anti-IDOR
        */
        Order order = getOrderById(orderId, currentUserId, isAdmin);
        
        /* 
            No puedes cancelar algo que ya se entregó o ya 
            se canceló, aquí se valida esto útlimo
        */
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cancelar un pedido en estado " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        log.info("AUDITORÍA: El usuario con ID {} CANCELÓ el pedido ID {}", currentUserId, orderId);

        return orderRepository.save(order);
    }

    /*
        Para el administador, ver absolutamente 
        todos los pedidos del sistema 
    */
    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersAdmin() {
        return orderRepository.findAll();
    }

    /* 
        Para el administrador, cambiar el estado de un pedido
    */
    @Override
    public Order updateOrderStatusAdmin(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        
        order.setStatus(newStatus);
        log.info("AUDITORÍA ADMIN: El estado del pedido ID {} cambió a {}", orderId, newStatus);

        return orderRepository.save(order);
    }

}