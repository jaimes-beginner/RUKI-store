package com.ruki.payment.services;

public interface PaymentService {

    String createPayment(Long orderId);
    void confirmPaymentFromWebhook(String stripeSessionId, Long orderId);
    
}
