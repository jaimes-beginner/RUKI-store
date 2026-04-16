package com.ruki.product.services;

import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import java.util.List;

public interface ProductService {

    /*
        Interfaz del servicio de producto, definendo 
        que tendrá la lógica de negocio para los productos.
        En este caso tiene para; Crear un producto, obtener 
        todos los productos activos, obtener productos por 
        categoría, obtener un producto por su ID, desactivar 
        un producto y descontar stock de un producto
    */

    ProductResponse createProduct(ProductCreate request);
    List<ProductResponse> getAllActiveProducts();
    List<ProductResponse> getProductsByCategory(Long categoryId);
    ProductResponse getProductById(Long id);
    void deactivateProduct(Long id);
    void discountStock(Long id, Integer quantity);

}