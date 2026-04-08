package com.ruki.user.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressUpdate {

    private String street;
    private String city;
    private String region;
    private String zipCode;
    private String referenceInfo;

}
