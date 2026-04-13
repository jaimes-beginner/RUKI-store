package com.ruki.product.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    /* 
        El formato de la respuesta del producto 
        (se devuelven todos los campos del producto 
        junto con la categoría a la que pertenece).
    */

    private Long id;
    private String name;
    private String description;
    private String mainImageUrl;
    private BigDecimal basePrice;
    private CategoryResponse category; 
    
}