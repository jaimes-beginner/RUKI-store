package com.ruki.order.requests;

import lombok.Data;
import java.math.BigDecimal;

/* 
    No necesitamos todos los datos del producto solo 
    necesitamos lo que le importa a una orden de compra;
    Saber si existe, su precio, y si está activo
*/

@Data
public class ProductClientResponse {
    private Long id;
    private String name;

    /* 
        El precio real que validaremos
    */
    private BigDecimal price;
    private boolean isActive; 
}
