package com.ruki.order.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

// CLASE PARA INTERCEPTAR EL UUID v4 QUE ENVÍA EL FRONTEND EN 
// CADA ORDEN, Y ASÍ GARANTIZAR LA IDEMPOTENCIA DE LAS ORDENES

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ruki_idempotency_keys")
public class IdempotencyKey {

    // EL NÚMERO DE TICKET ÚNICO (UUID) QUE ENVÍA EL FRONTEND, LO
    // VAMOS A USAR COMO EL ID PRINCIPAL POR DEFINICIÓN
    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String key;

    // SE ANOTARÁ LA A QUE HORA LLEGÓ EL TOCKET, PARA PODER 
    // LIMPIAR LOS TICKETS VIEJOS DESPUÉS
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
}