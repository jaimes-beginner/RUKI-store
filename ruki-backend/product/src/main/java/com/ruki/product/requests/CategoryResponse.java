package com.ruki.product.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    /*
        El formato de la respuesta de la categoría 
        (solo se verá el id y el nombre de la categoria). 
    */

    private Long id;
    private String name;
    
}