package com.ruki.product.repositories;

import com.ruki.product.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /*
        Método para buscar una categoría por su nombre (activo o inactivo)
    */
    Optional<Category> findByName(String name);

    /*
        Método para listar todas las categorías activas
    */
    List<Category> findAllByIsActiveTrue();

    /*
        Método para verificar si una categoría existe por su nombre
    */
    boolean existsByName(String name);

    /*
        Método para buscar una categoría por su ID y que esté activa
    */
    Optional<Category> findByIdAndIsActiveTrue(Long id);
    
}