package com.ruki.product.repositories;

import com.ruki.product.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /* 
        Repositorio en donde definimos métodos para 
        buscar una cateogoría por su nombre y otra
        para listar todas las categorías activas.
    */

    Optional<Category> findByName(String name);
    List<Category> findAllByIsActiveTrue();
    
} 
    
