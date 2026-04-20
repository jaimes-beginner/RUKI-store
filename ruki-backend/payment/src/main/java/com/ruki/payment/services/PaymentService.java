package com.ruki.payment.services;

import com.ruki.payment.entities.PaymentRecord;

public interface PaymentService {

    String createPayment(Long orderId);
    PaymentRecord confirmPayment(String token);
    
}
