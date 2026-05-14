package com.ruki.product.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> imageUrls;
    private BigDecimal basePrice;

    private Integer stock;

    private CategoryResponse category;
    private boolean active;
    private LocalDateTime createdAt;
    private boolean isSale;
    private BigDecimal salePrice;
    private List<VariantResponse> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String size;
        private Integer stock;
    }
    
}