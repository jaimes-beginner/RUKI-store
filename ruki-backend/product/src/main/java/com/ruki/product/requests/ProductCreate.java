package com.ruki.product.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

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
        Ahora recibimos un arreglo de URLs.
        El frontend debe enviar al menos una imagen (la principal).
    */
    @NotNull(message = "La lista de imágenes no puede ser nula")
    @Size(min = 1, message = "Debe haber al menos una imagen para el producto")
    private List<@org.hibernate.validator.constraints.URL(message = "Una de las rutas no es una URL válida") String> imageUrls;

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
