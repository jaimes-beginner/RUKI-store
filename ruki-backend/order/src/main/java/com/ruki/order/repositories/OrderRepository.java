package com.ruki.order.repositories;

import com.ruki.order.entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // BUSCAR TODAS LAS ÓRDENES DE UN USUARIO ESPECÍFICO ORDENADAS DE LA MÁS NUEVA A LA MÁS ANTIGUA
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /*
        Busca una orden por su ID
    */
    Optional<Order> findById(Long id);

    /*
        Verifica si una orden existe por su ID y pertenece a un usuario específico
    */
    boolean existsByIdAndUserId(Long id, Long userId); 

}