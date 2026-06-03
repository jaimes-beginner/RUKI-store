package com.ruki.order.requests;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreate {

    // @NotNull(message = "El ID de la dirección de envío es obligatorio para compras online") 
    // @Positive(message = "El ID de la dirección de envío debe ser válido") 
    private Long shippingAddressId;

    @NotEmpty(message = "El pedido debe contener al menos un producto")
    @Valid 
    private List<OrderItemRequest> items;
    
}