package com.ruki.product.services;

import com.ruki.product.requests.CategoryCreate;
import com.ruki.product.requests.CategoryResponse;
import java.util.List;

public interface CategoryService {

    /*
        Interfaz del servicio de categoría, definendo 
        que tendrá la lógica de negocio para las caterogrías.
        En este caso tiene para; Crear una categoría, obtener 
        todas las categorías activas, obtener una categoría por 
        su ID y desactivar una categoría.
    */

    CategoryResponse createCategory(CategoryCreate request);
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(Long id);
    void deactivateCategory(Long id);

}