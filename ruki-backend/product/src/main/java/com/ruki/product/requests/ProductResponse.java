package com.ruki.product.requests;

import lombok.Builder; 
import lombok.Value; 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

@Value 
@Builder 
public class ProductResponse {

    Long id;
    String name;
    String description;
    List<String> imageUrls;
    BigDecimal basePrice;
    Integer stock; 
    CategoryResponse category;
    boolean active;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;
    boolean isSale;
    BigDecimal salePrice;
    List<VariantResponse> variants;

    @Value 
    @Builder 
    public static class VariantResponse {
        Long id;
        String size;
        Integer stock;
    }
}