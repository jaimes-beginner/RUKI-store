package com.ruki.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.ruki.order.requests.ProductClientResponse;

/* 
    Se conecta al Microservicio de Productos 
    en el puerto 8081 para obtener la información 
    de un producto específico
*/
@FeignClient(name = "product-service", url = "${app.clients.product-service.url}")
public interface ProductClient {

    @GetMapping("/api-ruki/products/{id}")
    ProductClientResponse getProductById(@PathVariable("id") Long id);
}