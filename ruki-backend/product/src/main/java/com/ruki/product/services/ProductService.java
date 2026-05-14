package com.ruki.product.services;

import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    /*
        Interfaz para definir que debe tener el 
        servicio de productos, crear producto, obtener todos 
        los productos activos, obtener productos por 
        categoría, obtener producto por ID, desactivar 
        producto, descontar stock, actualizar producto, agregar 
        stock en caso de compras fallidas, obtener productos
        recientes, obtener productos en oferta para buscar según 
        los parámetros de filtrado dinámico
    */

    ProductResponse createProduct(ProductCreate request);
    List<ProductResponse> getAllActiveProducts();
    List<ProductResponse> getProductsByCategory(Long categoryId);
    ProductResponse getProductById(Long id);
    void deactivateProduct(Long id);
    void discountStock(Long id, Integer quantity);
    ProductResponse updateProduct(Long id, ProductUpdate request);
    void addStock(Long id, Integer quantity);
    List<ProductResponse> getNewArrivals();
    List<ProductResponse> getSaleProducts();
    List<ProductResponse> filterProducts(Long categoryId, String size, BigDecimal minPrice, BigDecimal maxPrice, String sort);

}