package com.ruki.order.requests;

import com.fasterxml.jackson.annotation.JsonFormat; 
import com.ruki.order.entities.OrderStatus; 
import lombok.Builder;
import lombok.Value; 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class OrderResponse {

    Long id;
    Long userId;
    Long shippingAddressId;
    OrderStatus status;
    BigDecimal totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;
    List<OrderItemResponse> items;
    BigDecimal subTotal;
    BigDecimal taxAmount;
    String userEmail;

    /*
        Response creado aquí mismo ya que la respuesta de un pedido
        está fuertemente ligada a los productos que están en ella, además
        nos ahorra crear más DTOs
    */
    @Value
    @Builder
    public static class OrderItemResponse {
        Long id;
        Long productId;
        Integer quantity;
        BigDecimal unitPrice;
        BigDecimal subTotal;
        String size;
    }

}