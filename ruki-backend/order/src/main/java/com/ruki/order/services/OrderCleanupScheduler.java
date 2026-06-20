package com.ruki.order.services;

import com.ruki.order.entities.OrderStatus;
import com.ruki.order.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // ESTO SE EJECUTA CADA 5 MINUTOS (300,000 ms) Y USA 
    // readOnly = true PARA MÁXIMA VELOCIDAD EN LA BASE DE DATOS
    @Scheduled(fixedRate = 300000)
    @Transactional(readOnly = true)
    public void cleanAbandonedOrders() {

        // LIMITE, ORDENDES CREADAS HACE MÁS DE 30 MINUTOS
        LocalDateTime threshold = LocalDateTime.now(java.time.ZoneId.of("UTC")).minusMinutes(30);
        
        // CON PAGINACIÓN TRAEMOS SOLO LOS LOTES DE 50 IDs PARA NO SATURAR LA MEMORIA RAM
        Page<Long> abandonedOrderIds = orderRepository.findAbandonedOrderIds(
                OrderStatus.PENDING, 
                threshold, 
                PageRequest.of(0, 50)
        );

        if (abandonedOrderIds.hasContent()) {
            log.info("CRON JOB | Se encontraron {} pedidos abandonados. Iniciando rollback asíncrono por lotes...", abandonedOrderIds.getNumberOfElements());
            
            for (Long orderId : abandonedOrderIds) {

                // DELEGAMOS EL TRABAJO PESADO A UN HILO SECUNDARIO (@Async)
                orderService.rollbackAbandonedOrder(orderId);
            }
            
        } else {
            log.info("CRON JOB | No se encontraron pedidos abandonados en este ciclo.");
        }
    }
}