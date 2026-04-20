package com.ruki.order.services;

import com.ruki.order.requests.OrderCreate;

import java.util.List;

import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderStatus;

public interface OrderService {

    /*
        Definiendo el método para 
        crear una orden de compra, obtener una orden por 
        ID, obtener mis órdenes, cancelar una orden, obtener 
        todas las órdenes (admin) y actualizar el estado de 
        una orden (admin)
    */
   
    Order createOrder(OrderCreate request, Long userId);
    Order getOrderById(Long orderId, Long currentUserId, boolean isAdmin);
    List<Order> getMyOrders(Long currentUserId);
    Order cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin);
    List<Order> getAllOrdersAdmin();
    Order updateOrderStatusAdmin(Long orderId, OrderStatus newStatus);
    Order updateStatusFromPayment(Long orderId, String status);

}