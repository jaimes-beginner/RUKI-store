package com.ruki.product.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryCreate {

    /* 
        Request/requerimientos para 
        crear una nueva categoría, en 
        este caso solo el nombre del mismo.
    */

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    private String name;

}