package com.ruki.order.requests;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreate {

    /* 
        Esta clase representa la estructura de datos que 
        se va a recibir en el cuerpo de la solicitud (request) 
        cuando un cliente quiera crear un nuevo pedido
    */

    @NotNull(message = "Debes seleccionar una dirección de envío")
    @Positive(message = "El ID de la dirección debe ser válido")
    private Long shippingAddressId;

    @NotEmpty(message = "El pedido debe contener al menos un producto")
    @Valid 
    private List<OrderItemRequest> items;
    
}