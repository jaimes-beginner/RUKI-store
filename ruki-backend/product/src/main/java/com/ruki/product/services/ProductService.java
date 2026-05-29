package com.ruki.product.services;

import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductCreate request);
    List<ProductResponse> getAllActiveProducts();
    List<ProductResponse> getProductsByCategory(Long categoryId);
    ProductResponse getProductById(Long id);
    void deactivateProduct(Long id);
    ProductResponse updateProduct(Long id, ProductUpdate request);
    void addStock(Long id, Integer quantity, String size);
    void discountStock(Long id, Integer quantity, String size); 
    List<ProductResponse> getNewArrivals();
    List<ProductResponse> getSaleProducts();
    List<ProductResponse> filterProducts(Long categoryId, String size, BigDecimal minPrice, BigDecimal maxPrice, String sort);

}