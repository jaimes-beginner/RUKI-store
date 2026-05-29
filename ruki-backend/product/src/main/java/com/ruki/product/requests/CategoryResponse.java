package com.ruki.product.requests;

import lombok.Builder; 
import lombok.Value; 

@Value
@Builder 
public class CategoryResponse {

    Long id;
    String name;
    
}