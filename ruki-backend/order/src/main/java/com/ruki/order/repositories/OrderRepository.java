package com.ruki.order.repositories;

import com.ruki.order.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /*
        Busca todas las órdenes de un usuario 
        específico, ordenándolas de la más nueva a la más antigua
    */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    /*
        Busca una orden por su ID
    */
    Optional<Order> findById(Long id);

    /*
        Verifica si una orden existe por su ID y pertenece a un usuario específico
    */
    boolean existsByIdAndUserId(Long id, Long userId); 

}