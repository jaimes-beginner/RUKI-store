package com.ruki.user.requests;

import jakarta.validation.constraints.Size; 
import lombok.AllArgsConstructor;
import lombok.Builder; 
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class AddressUpdate {

    @Size(max = 150, message = "La calle no puede exceder los 150 caracteres")
    private String street;

    @Size(max = 100, message = "La ciudad no puede exceder los 100 caracteres")
    private String city;

    @Size(max = 100, message = "La región no puede exceder los 100 caracteres")
    private String region;

    @Size(max = 20, message = "El código postal no puede exceder los 20 caracteres")
    private String zipCode;

    @Size(max = 255, message = "La información de referencia no puede exceder los 255 caracteres")
    private String referenceInfo;
    
}