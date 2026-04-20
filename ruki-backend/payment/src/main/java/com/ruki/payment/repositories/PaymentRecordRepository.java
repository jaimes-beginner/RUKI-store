package com.ruki.payment.repositories;

import com.ruki.payment.entities.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    
    /* 
        Transbank nos avisará del pago mandandonos solo el 
        token, con este método a que orden le pertenece el token
    */
    Optional<PaymentRecord> findByTokenWs(String tokenWs);
    
    /* 
        Para buscar una pago por el id de una orden (buscar pagos 
        según la orden que le corresponde)
    */
    Optional<PaymentRecord> findByOrderId(Long orderId);
    
}