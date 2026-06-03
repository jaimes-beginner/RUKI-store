package com.ruki.order.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder; 
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder 
@Entity
@Table(name = "ruki_order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
        Relación de muchos a uno con Order, ya que un ítem pertenece a una única orden.
        FetchType.LAZY para carga perezosa, y @JsonIgnore, @ToString.Exclude, @EqualsAndHashCode.Exclude
        para evitar ciclos infinitos en serialización y métodos de Lombok
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Order order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "size", length = 20)
    private String size;
    
}