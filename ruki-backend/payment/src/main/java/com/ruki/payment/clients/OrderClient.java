package com.ruki.payment.clients;

import com.ruki.payment.requests.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${app.clients.order-service.url}/api-ruki/orders")
public interface OrderClient {

    /* 
        Endpoint para comunicarnos con el microservicio de 
        pedidos y preguntarle cuanto vale la orden
    */
    @GetMapping("/{id}")
    OrderResponse getOrderById(@PathVariable("id") Long id);

    /* 
        Una vez pagada la orden le avisamos al microservicio 
        de pedidos que cambie el estado de la orden a PAID
    */
    @PutMapping("/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);

}