package com.ruki.order.services;

import com.ruki.order.requests.OrderCreate;
import java.util.List;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.requests.OrderResponse;
import com.ruki.order.requests.PageResponse; 

public interface OrderService {

    OrderResponse createOrder(OrderCreate request, Long userId);
    OrderResponse getOrderById(Long orderId, Long currentUserId, boolean isAdmin); 
    PageResponse<OrderResponse> getMyOrders(Long currentUserId, int page, int size);
    OrderResponse cancelMyOrder(Long orderId, Long currentUserId, boolean isAdmin); 
    List<OrderResponse> getAllOrdersAdmin(); 
    OrderResponse updateOrderStatusAdmin(Long orderId, OrderStatus newStatus); 
    OrderResponse updateStatusFromPayment(Long orderId, String status);
    OrderResponse createPhysicalOrder(OrderCreate request, Long adminId);

}