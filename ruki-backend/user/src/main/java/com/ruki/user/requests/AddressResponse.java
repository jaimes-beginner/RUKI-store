package com.ruki.user.requests;

import lombok.Builder; 
import lombok.Value; 

@Value 
@Builder 
public class AddressResponse {

    Long id;
    String street;
    String city;
    String region;
    String zipCode;
    String referenceInfo;
    Long userId;
    
}