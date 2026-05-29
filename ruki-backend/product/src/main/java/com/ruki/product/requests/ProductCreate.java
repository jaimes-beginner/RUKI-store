package com.ruki.product.requests;

import jakarta.validation.Valid; 
import jakarta.validation.constraints.DecimalMin; 
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor; 
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor; 
import org.hibernate.validator.constraints.URL;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class ProductCreate {

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String name;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;

    @NotNull(message = "La lista de imágenes no puede ser nula")
    @Size(min = 1, message = "Debe haber al menos una imagen para el producto")
    private List<@URL(message = "Una de las rutas no es una URL válida") String> imageUrls;

    @NotNull(message = "El precio base es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio base debe ser mayor a cero") 
    private BigDecimal basePrice;

    @Min(value = 0, message = "El stock no puede ser negativo")
    @JsonProperty("stock")
    private Integer stock = 0;

    @NotNull(message = "El ID de la categoría es obligatorio")
    @Positive(message = "El ID de la categoría debe ser mayor a cero")
    private Long categoryId;

    @JsonProperty("isSale")
    private boolean isSale = false;

    @DecimalMin(value = "0.01", message = "El precio de oferta debe ser mayor a cero si se aplica") // Validar precio de oferta
    private BigDecimal salePrice;

    @NotNull(message = "Debe incluir al menos una talla con su stock")
    @Size(min = 1, message = "Debe haber al menos una talla")
    @Valid 
    private List<VariantRequest> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VariantRequest {

        @NotBlank(message = "La talla es obligatoria")
        @Size(max = 10, message = "La talla no puede exceder los 10 caracteres") 
        private String size;

        @Min(value = 0, message = "El stock de la talla no puede ser negativo")
        @NotNull(message = "El stock de la talla es obligatorio") 
        private Integer stock;

    }

}