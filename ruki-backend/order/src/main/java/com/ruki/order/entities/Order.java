package com.ruki.order.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ruki_orders")
public class Order {

    /* 
        Esta clase representa la entidad 'Orden' o 'Pedido' 
        en nuestro sistema. Aquí se guardan los datos principales 
        de cada orden, como el ID del usuario, la dirección de 
        envío, el estado del pedido, el monto total, entre otros
    */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* 
        Solo guardamos el ID del usuario
        o cliente que hizo el pedido
    */
    @Column(nullable = false)
    private Long userId;

    /* 
        Solo guardamos el ID de la dirección
    */
    @Column(nullable = false)
    private Long shippingAddressId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /* 
        Relación de uno a muchos, ya que una orden 
        puede tener muchos items/productos dentro
    */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

}
