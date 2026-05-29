package com.ruki.product.services;

import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryCreate request);
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(Long id);
    void deactivateCategory(Long id);
    CategoryResponse updateCategory(Long id, CategoryCreate request); 
    
}