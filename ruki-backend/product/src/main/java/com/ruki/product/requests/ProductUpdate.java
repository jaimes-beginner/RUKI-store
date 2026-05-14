package com.ruki.product.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ProductUpdate {

    /* 
        Request para actualizar parcialmente un producto.
        Todos los campos son opcionales, pero si se envían,
        deben cumplir con las validaciones correspondientes
    */

    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String name;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;

    @Size(min = 1, message = "Si envías imágenes, debe haber al menos una para el producto")
    private List<@org.hibernate.validator.constraints.URL(message = "Una de las rutas no es una URL válida") String> imageUrls;

    @Positive(message = "El precio debe ser mayor a cero")
    private BigDecimal basePrice;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Positive(message = "El ID de la categoría debe ser mayor a cero")
    private Long categoryId;

    @JsonProperty("isSale")
    private Boolean isSale;  

    private BigDecimal salePrice;

    private List<ProductCreate.VariantRequest> variants;
}