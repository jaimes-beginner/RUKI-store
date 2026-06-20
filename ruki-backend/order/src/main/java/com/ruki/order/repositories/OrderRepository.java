package com.ruki.order.repositories;

import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // BUSCAR TODAS LAS ÓRDENES DE UN USUARIO ESPECÍFICO ORDENADAS DE LA MÁS NUEVA A LA MÁS ANTIGUA
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // BUSCAR ÓRDENES DE UN USUARIO FILTRADAS POR ESTADO O ID DE ORDEN CON PAGINACIÓN
    @Query("SELECT o FROM Order o WHERE o.userId = :userId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:orderId IS NULL OR o.id = :orderId)")
    Page<Order> findMyOrdersFiltered(
            @Param("userId") Long userId,
            @Param("status") OrderStatus status,
            @Param("orderId") Long orderId,
            Pageable pageable);

    /*
        Busca una orden por su ID
    */
    Optional<Order> findById(Long id);

    /*
        Verifica si una orden existe por su ID y pertenece a un usuario específico
    */
    boolean existsByIdAndUserId(Long id, Long userId); 

    // CRON JOB OPTIMIZADO, SOLO TRAE LOS IDS DE LAS ÓRDENES ABANDONADAS CON PAGINACIÓN
    @Query("SELECT o.id FROM Order o WHERE o.status = :status AND o.createdAt < :timeThreshold")
    Page<Long> findAbandonedOrderIds(
            @Param("status") OrderStatus status, 
            @Param("timeThreshold") java.time.LocalDateTime timeThreshold, 
            Pageable pageable
    );

}