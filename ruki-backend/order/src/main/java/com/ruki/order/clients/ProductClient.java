package com.ruki.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.ruki.order.requests.ProductClientResponse;

@FeignClient(name = "product-service", url = "${app.clients.product-service.url}")
public interface ProductClient {

    @GetMapping("/api-ruki/products/{id}")
    ProductClientResponse getProductById(@PathVariable("id") Long id);

    @PutMapping("/api-ruki/products/{id}/discount-stock")
    void discountStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity, @RequestParam(value = "size", required = false) String size);

    @PutMapping("/api-ruki/products/{id}/add-stock")
    void addStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity, @RequestParam(value = "size", required = false) String size);
    
}