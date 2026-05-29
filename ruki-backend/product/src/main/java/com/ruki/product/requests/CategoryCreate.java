package com.ruki.product.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size; 
import lombok.AllArgsConstructor; 
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryCreate {

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre de la categoría debe tener entre 2 y 100 caracteres") 
    private String name;
    
}