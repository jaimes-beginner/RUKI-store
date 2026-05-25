package com.ruki.user.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size; 
import lombok.AllArgsConstructor;
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class AddressCreate {

    @NotNull(message = "El ID del usuario es obligatorio para asociar la dirección")
    @Positive(message = "El ID del usuario debe ser mayor que cero")
    private Long userId;

    @NotBlank(message = "La calle y número son obligatorios")
    @Size(max = 150, message = "La calle no puede exceder los 150 caracteres") 
    private String street;

    @NotBlank(message = "La comuna/ciudad es obligatoria")
    @Size(max = 100, message = "La ciudad no puede exceder los 100 caracteres") 
    private String city;

    @NotBlank(message = "La región es obligatoria")
    @Size(max = 100, message = "La región no puede exceder los 100 caracteres") 
    private String region;

    @Size(max = 30, message = "El código postal no puede exceder los 30 caracteres") 
    private String zipCode;

    @Size(max = 255, message = "La información de referencia no puede exceder los 255 caracteres") 
    private String referenceInfo;

}