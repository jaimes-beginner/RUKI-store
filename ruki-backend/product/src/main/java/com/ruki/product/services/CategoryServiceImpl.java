package com.ruki.product.services;

import com.ruki.product.entities.Category;
import com.ruki.product.exceptions.ResourceConflictException; 
import com.ruki.product.exceptions.ResourceNotFoundException; 
import com.ruki.product.repositories.CategoryRepository;
import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j 
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    /*
        Método para crear una nueva categoría
    */
    @Override
    public CategoryResponse createCategory(CategoryCreate request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceConflictException("La categoría '" + request.getName() + "' ya existe en el catálogo.");
        }

        Category category = Category.builder() 
                .name(request.getName())
                .isActive(true) 
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Categoría creada con ID {} y nombre '{}'", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    /*
        Método para obtener todas las categorías activas
    */
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        log.debug("Obteniendo todas las categorías activas.");
        return categoryRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener una categoría por su ID
    */
    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
        log.debug("Categoría con ID {} encontrada.", id);
        return toResponse(category);
    }

    /*
        Método para desactivar (soft delete) una categoría
    */
    @Override
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        if (!category.isActive()) {
            log.warn("Intento de desactivar categoría con ID {} que ya estaba inactiva.", id);

            /*
                Ya está inactiva, no hacer nada
            */
            return; 
        }

        category.setActive(false);
        categoryRepository.save(category);
        log.info("Categoría con ID {} desactivada (soft delete).", id);
    }

    /*
        Método para actualizar una categoría existente
    */
    @Override
    public CategoryResponse updateCategory(Long id, CategoryCreate request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));

        /*
            Verificar si el nuevo nombre ya existe y no es el de la categoría actual
        */
        if (request.getName() != null && !request.getName().equalsIgnoreCase(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new ResourceConflictException("El nombre de categoría '" + request.getName() + "' ya está en uso.");
            }
            category.setName(request.getName());
        }

        Category updated = categoryRepository.save(category);
        log.info("Categoría con ID {} actualizada con nombre '{}'.", updated.getId(), updated.getName());
        return toResponse(updated);
    }

    /*
        Método auxiliar para convertir una entidad Category a un CategoryResponse
    */
    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

}