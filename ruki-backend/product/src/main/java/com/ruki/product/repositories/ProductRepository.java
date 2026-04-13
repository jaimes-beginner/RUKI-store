package com.ruki.product.repositories;

import com.ruki.product.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /* 
        Repositorio en donde definimos métodos para 
        listar todos los productos activos y los productos
        por categoría y estado.
    */

    List<Product> findAllByIsActiveTrue();
    List<Product> findAllByCategoryIdAndIsActiveTrue(Long categoryId);
}