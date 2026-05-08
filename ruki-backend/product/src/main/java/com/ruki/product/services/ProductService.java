package com.ruki.product.services;

import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import java.util.List;

public interface ProductService {

    /*
        Interfaz para definir que debe tener el 
        servicio de productos, crear producto, obtener todos 
        los productos activos, obtener productos por 
        categoría, obtener producto por ID, desactivar 
        producto, descontar stock, actualizar producto
        y agregar stock en caso de compras fallidas
    */

    ProductResponse createProduct(ProductCreate request);
    List<ProductResponse> getAllActiveProducts();
    List<ProductResponse> getProductsByCategory(Long categoryId);
    ProductResponse getProductById(Long id);
    void deactivateProduct(Long id);
    void discountStock(Long id, Integer quantity);
    ProductResponse updateProduct(Long id, ProductUpdate request);
    void addStock(Long id, Integer quantity);

}