package com.ruki.user.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    
    private Long id;
    private String street;
    private String city;
    private String region;
    private String zipCode;
    private String referenceInfo;

    /*
        En este caso devolvemos el ID del 
        usuario para que el frontend sepa 
        a quién pertenece esta dirección
    */
    private Long userId; 

}