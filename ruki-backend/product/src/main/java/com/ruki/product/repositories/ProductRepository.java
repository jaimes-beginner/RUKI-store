package com.ruki.product.repositories;

import com.ruki.product.entities.Product;
import com.ruki.product.requests.PageResponse;
import com.ruki.product.requests.ProductResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; 
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional; 

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // OBTENER LOS PRODUCTOS ACTIVOS CON PAGINACIÓN
    Page<Product> findAllByIsActiveTrue(Pageable pageable);

    // OBTENER LOS PRODUCTOS ACTIVOS ORDENADOS POR FECHA DE CREACIÓN DESCENDENTE CON PAGINACIÓN
    Page<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    // OBTENER LOS PRODUCTOS EN OFERTA ACTIVOS CON PAGINACIÓN
    Page<Product> findAllByIsActiveTrueAndIsSaleTrue(Pageable pageable);



    /*
        Listar productos activos por categoría
    */
    List<Product> findAllByCategoryIdAndIsActiveTrue(Long categoryId);

    /*
        Obtener los últimos 12 productos activos ordenados 
        por fecha de creación descendente
    */
    List<Product> findTop12ByIsActiveTrueOrderByCreatedAtDesc();

    /*
        Buscar un producto por su ID y que esté activo
    */
    Optional<Product> findByIdAndIsActiveTrue(Long id);

    // CONSULTA PARA FILTRAR PRODUCTOS POR CATEGORÍA, TALLA Y RANGO DE PRECIOS CON PAGINACIÓN
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:size IS NULL OR v.size = :size) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)")
    Page<Product> findFilteredProducts(@Param("categoryId") Long categoryId,
                                       @Param("size") String size,
                                       @Param("minPrice") BigDecimal minPrice,
                                       @Param("maxPrice") BigDecimal maxPrice,
                                       Pageable pageable);

}