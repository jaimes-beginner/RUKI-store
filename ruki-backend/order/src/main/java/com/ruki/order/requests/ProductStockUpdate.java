package com.ruki.order.requests;

import jakarta.validation.constraints.Min; 
import jakarta.validation.constraints.NotBlank; 
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size; 
import lombok.AllArgsConstructor; 
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class ProductStockUpdate {

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1") 
    private Integer quantity;

    @NotBlank(message = "La talla es obligatoria")
    @Size(max = 20, message = "La talla no puede exceder los 20 caracteres") 
    private String size;
    
}