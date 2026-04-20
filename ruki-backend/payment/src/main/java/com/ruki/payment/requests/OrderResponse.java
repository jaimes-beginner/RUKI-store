package com.ruki.payment.requests;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderResponse {

    private Long id;
    private BigDecimal totalAmount;
    private String status;
    
}
