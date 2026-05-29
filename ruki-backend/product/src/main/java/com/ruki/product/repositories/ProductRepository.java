package com.ruki.product.repositories;

import com.ruki.product.entities.Product;
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

    /*
        Listar todos los productos activos
    */
    List<Product> findAllByIsActiveTrue();

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
        Obtener todos los productos activos que están en oferta
    */
    List<Product> findAllByIsActiveTrueAndIsSaleTrue();

    /*
        Buscar un producto por su ID y que esté activo
    */
    Optional<Product> findByIdAndIsActiveTrue(Long id);

    /*
        Consulta para filtrar productos dinámicamente
    */
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

    /*
        Método para obtener los últimos N productos 
        activos (para New Arrivals, si N es variable)
    */
    List<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}