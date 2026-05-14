package com.ruki.product.repositories;

import com.ruki.product.entities.Product;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /* 
        Repositorio en donde definimos métodos para 
        listar todos los productos activos y los productos
        por categoría y estado, obtener los últimos 12 productos 
        activos ordenador por fecha descendentemente para los 
        ARRIVALS y obtener todos los productos que están en oferta
    */

    List<Product> findAllByIsActiveTrue();
    List<Product> findAllByCategoryIdAndIsActiveTrue(Long categoryId);
    List<Product> findTop12ByIsActiveTrueOrderByCreatedAtDesc();
    List<Product> findAllByIsActiveTrueAndIsSaleTrue();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:size IS NULL OR v.size = :size) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)")
    List<Product> findFilteredProducts(@Param("categoryId") Long categoryId,
                                       @Param("size") String size,
                                       @Param("minPrice") BigDecimal minPrice,
                                       @Param("maxPrice") BigDecimal maxPrice,
                                       Sort sort);
}