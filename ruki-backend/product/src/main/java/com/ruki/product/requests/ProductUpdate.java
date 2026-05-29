package com.ruki.product.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid; 
import jakarta.validation.constraints.DecimalMin; 
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor; 
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor; 
import org.hibernate.validator.constraints.URL; 
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class ProductUpdate {

    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String name;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;

    @Size(min = 1, message = "Si envías imágenes, debe haber al menos una para el producto")
    private List<@URL(message = "Una de las rutas no es una URL válida") String> imageUrls;

    @DecimalMin(value = "0.01", message = "El precio base debe ser mayor a cero") 
    private BigDecimal basePrice;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock; 

    @Positive(message = "El ID de la categoría debe ser mayor a cero")
    private Long categoryId;

    @JsonProperty("isSale")
    private Boolean isSale;

    @DecimalMin(value = "0.01", message = "El precio de oferta debe ser mayor a cero si se aplica") 
    private BigDecimal salePrice;

    @Valid 
    private List<ProductCreate.VariantRequest> variants;
    
}