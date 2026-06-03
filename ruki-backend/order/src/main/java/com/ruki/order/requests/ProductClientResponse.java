package com.ruki.order.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data; 
import lombok.NoArgsConstructor; 
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductClientResponse {

    private Long id;
    private String name;
    private String description; 
    private List<String> imageUrls; 
    private BigDecimal basePrice; 
    private Integer stock; 
    private boolean isActive; 

    @JsonAlias({"sale", "isSale", "is_sale"})
    private boolean isSale; 

    private BigDecimal salePrice; 

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss.SSSSSS")
    private LocalDateTime createdAt; 

    private List<VariantClientResponse> variants; 

    @Data 
    @NoArgsConstructor 
    @AllArgsConstructor 
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class VariantClientResponse {
        private Long id; /* Añadir private */
        private String size; /* Añadir private */
        private Integer stock; /* Añadir private */
    }
}