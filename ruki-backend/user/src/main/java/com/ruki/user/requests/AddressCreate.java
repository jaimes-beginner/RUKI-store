package com.ruki.user.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressCreate {

    /*
        Aquí van los datos necesarios que hay que 
        ingresar para poder crear una dirección, con 
        sus respectivas validaciones
    */

    @NotNull(message = "El ID del usuario es obligatorio para asociar la dirección")
    @Positive(message = "El ID del usuario debe ser mayor que cero")
    private Long userId;

    @NotBlank(message = "La calle y número son obligatorios")
    private String street;

    @NotBlank(message = "La comuna/ciudad es obligatoria")
    private String city;

    @NotBlank(message = "La región es obligatoria")
    private String region;

    private String zipCode; 
    private String referenceInfo; 
    
}