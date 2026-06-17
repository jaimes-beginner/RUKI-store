package com.ruki.order.services;

import com.ruki.order.clients.ProductClient;
import com.ruki.order.clients.UserClient;
import com.ruki.order.entities.Order;
import com.ruki.order.entities.OrderStatus;
import com.ruki.order.exceptions.ResourceConflictException;
import com.ruki.order.repositories.OrderRepository;
import com.ruki.order.requests.OrderCreate;
import com.ruki.order.requests.OrderItemRequest;
import com.ruki.order.requests.OrderResponse;
import com.ruki.order.requests.ProductClientResponse;
import com.ruki.order.requests.UserClientResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductClient productClient;
    @Mock private UserClient userClient;
    @Mock private EmailService emailService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    @DisplayName("ÉXITO | Debe crear un pedido correctamente cuando hay stock")
    void createOrder_Success() {

        // PREPARANDO DATOS, CONFIGURANDO EL SIMULADOR
        Long userId = 1L;
        OrderCreate request = new OrderCreate(2L, List.of(new OrderItemRequest(100L, 2, "M")));
        
        // SIMULANDO LA RESPUESTA DEL MICROSERVICIO DE USUARIOS
        when(userClient.getUserById(userId)).thenReturn(new UserClientResponse(userId, "test@ruki.com", "Juan"));
        
        // SIMULANDO LA RESPUESTA DEL MICROSERVICIO DE PRODUCTOS, PRODUCTOS CON STOCK
        ProductClientResponse mockProduct = ProductClientResponse.builder()
                .id(100L).name("Polera RUKI").basePrice(new BigDecimal("10000"))
                .stock(10).isActive(true).isSale(false).build();
        when(productClient.getProductById(100L)).thenReturn(mockProduct);
        
        // SIMULANDO EL GUARDADO EN LA BASE DE DATOS
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(500L); // Le asignamos un ID falso de BD
            return savedOrder;
        });

        // EJECUCIÓN, APRETAMOS EL BOTÓN
        OrderResponse response = orderService.createOrder(request, userId);

        // VERIFICACIÓN PARA COMPROBAR QUE NO HAYA SALIDO MAL 
        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("23800"), response.getTotalAmount()); // 20000 + 19% IVA
        
        // VERIFICANDO QUE EL SIMULADOR LLAMÓ A DESCONTAR STOCK EXACTAMENTE 1 VEZ CON LOS PARÁMETROS CORRECTOS
        verify(productClient, times(1)).discountStock(100L, 2, "M");
    }

    @Test
    @DisplayName("ERROR | Debe lanzar excepción si no hay stock suficiente")
    void createOrder_ThrowsException_WhenOutOfStock() {

        // PREPARANDO DATOS, CONFIGURANDO EL SIMULADOR
        Long userId = 1L;
        OrderCreate request = new OrderCreate(2L, List.of(new OrderItemRequest(100L, 5, "M")));
        
        // SIMULANDO LA RESPUESTA DEL MICROSERVICIO DE PRODUCTOS, PRODUCTOS CON STOCK INSUFICIENTE
        ProductClientResponse mockProduct = ProductClientResponse.builder()
                .id(100L).name("Polera RUKI").basePrice(new BigDecimal("10000"))
                .stock(2).isActive(true).build();
        
        when(userClient.getUserById(userId)).thenReturn(new UserClientResponse(userId, "test@ruki.com", "Juan"));
        when(productClient.getProductById(100L)).thenReturn(mockProduct);

        // EJECUCIÓN Y VERIFICACIÓN
        ResourceConflictException exception = assertThrows(ResourceConflictException.class, () -> {
            orderService.createOrder(request, userId);
        });

        assertTrue(exception.getMessage().contains("Stock insuficiente"));
        
        // VERIFICANDO QUE NUNCA SE LLAMÓ A GUARDAR EN LA BASE DE DATOS
        verify(orderRepository, never()).save(any());
    }
}