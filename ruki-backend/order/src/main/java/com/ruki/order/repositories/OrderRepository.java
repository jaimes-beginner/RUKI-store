package com.ruki.order.repositories;

import com.ruki.order.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /* 
        Busca todas las órdenes de un usuario 
        ordenadas por fecha descendente 
    */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
}