package com.ruki.order.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ruki_order_items")
public class OrderItem {

    /* 
        Esta clase representa la entidad 'Item' o 'Producto' 
        dentro de una orden/pedido. Aquí se guardan los datos 
        específicos de cada producto que se quiere comprar, como 
        el ID del producto, la cantidad y el precio unitario
    */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* 
        Esto debe tener una relación de a muchos a 
        uno, ya que una orden/pedido puede tener muchos 
        productos, pero cada producto solo pertenece a una orden
    */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    /* 
        Aquí tenemos el id del producto que se quiere 
        comprar, pero no guardamos el nombre ni la descripción
    */
    @Column(nullable = false)
    private Long productId;

    /* 
        Cantidad de este producto que se quiere comprar
    */
    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /* 
        Subtotal del item (cantidad * precio unitario)
    */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

}