package com.ruki.order.requests;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    /* 
        Esta clase representa la estructura de datos que 
        se va a recibir en el cuerpo de la solicitud (request) 
        cuando un cliente quiera agregar un producto a su orden
        con sus respectivas validaciónes
    */

    @NotNull(message = "El ID del producto es obligatorio")
    @Positive(message = "El ID del producto debe ser válido")
    private Long productId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    private Integer quantity;

}