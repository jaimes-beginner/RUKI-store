package com.ruki.product.services;

import com.ruki.product.entities.Category;
import com.ruki.product.repositories.CategoryRepository;
import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    /*
        Método para crear una categoría.
    */
    @Override
    public CategoryResponse createCategory(CategoryCreate request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new ResponseStatusException(CONFLICT, "La categoría ya existe en el catálogo");
        }

        Category category = new Category();
        category.setName(request.getName());

        Category saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getId(), saved.getName());
    }

    /*
        Método para listar todas las categorías activas.
    */
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllByIsActiveTrue()
                .stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    /*
        Método para obtener una categoría por su ID.
    */
    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));
        return new CategoryResponse(category.getId(), category.getName());
    }

    /*
        Método para desactivar una categoría por su ID.
    */
    @Override
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));
        category.setActive(false);
        categoryRepository.save(category);
    }
    
}
