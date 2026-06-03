package com.ruki.order.clients;

import com.ruki.order.requests.UserClientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import feign.Headers; 

/*
    Se conecta al microservicio de usuarios para consultar datos
*/
@FeignClient(name = "user-service", url = "${app.clients.user-service.url:http://localhost:8080}")
@Headers("Content-Type: application/json")
public interface UserClient {

    @GetMapping("/api-ruki/users/{id}")
    UserClientResponse getUserById(@PathVariable("id") Long id);

}