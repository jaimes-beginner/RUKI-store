package com.ruki.payment.clients;

import com.ruki.payment.requests.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import feign.Headers; /* Importar Headers */

@FeignClient(name = "order-service", url = "${app.clients.order-service.url}/api-ruki/orders")
@Headers("Content-Type: application/json") /* Asegurar comunicación JSON */
public interface OrderClient {

    @GetMapping("/{id}")
    OrderResponse getOrderById(@PathVariable("id") Long id);

    @PutMapping("/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}