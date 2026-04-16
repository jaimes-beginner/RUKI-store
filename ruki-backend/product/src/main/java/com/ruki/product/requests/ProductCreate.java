package com.ruki.product.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductCreate {

    /* 
        Request/requerimientos para crear un nuevo 
        producto, en este caso se necesita el nombre, una 
        descripcion opcional, una imagen opcional, el precio 
        base y el ID de la categoría que le corresponda.
    */

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String name;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    private String description;
    
    /*
        Validamos que si mandan una 
        URL, tenga formato real de enlace.
    */
    @org.hibernate.validator.constraints.URL(message = "Debe ser una URL válida")
    private String mainImageUrl;

    @NotNull(message = "El precio base es obligatorio")
    @Positive(message = "El precio debe ser mayor a cero")
    private BigDecimal basePrice;

    @NotNull(message = "El stock inicial es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @NotNull(message = "El ID de la categoría es obligatorio")
    @Positive(message = "El ID de la categoría debe ser mayor a cero")
    private Long categoryId;

}
