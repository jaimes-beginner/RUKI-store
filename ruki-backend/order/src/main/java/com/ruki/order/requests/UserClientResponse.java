package com.ruki.order.requests;

import lombok.Data;

@Data
public class UserClientResponse {

    /* 
        DTO para recibir la respuesta del microservicio 
        de usuario ya que solo nos interesa el email 
        y el nombre
    */

    private Long id;
    private String email;
    private String firstName;
    
}