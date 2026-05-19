package com.ruki.order.requests;

import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonAlias;

/* 
    No necesitamos todos los datos del producto solo 
    necesitamos lo que le importa a una orden de compra;
    Saber si existe, su precio, su stock, y si está activo
*/

@Data
public class ProductClientResponse {

    private Long id;
    private String name;
    private BigDecimal basePrice;
    private Integer stock;
    private boolean isActive;

    @JsonAlias({"sale", "isSale", "is_sale"})
    private boolean sale;

    private BigDecimal salePrice;

}
