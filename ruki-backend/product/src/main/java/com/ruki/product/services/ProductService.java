package com.ruki.product.services;

import com.ruki.product.requests.PageResponse;
import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductCreate request);
    PageResponse<ProductResponse> getAllActiveProducts(int page, int size);
    PageResponse<ProductResponse> getNewArrivals(int page, int size);
    PageResponse<ProductResponse> getSaleProducts(int page, int size);
    List<ProductResponse> getProductsByCategory(Long categoryId);
    ProductResponse getProductById(Long id);
    void deactivateProduct(Long id);
    ProductResponse updateProduct(Long id, ProductUpdate request);
    void addStock(Long id, Integer quantity, String size);
    void discountStock(Long id, Integer quantity, String size); 
    PageResponse<ProductResponse> filterProducts(Long categoryId, String size, BigDecimal minPrice, BigDecimal maxPrice, String sort, int page, int sizePage);
    List<ProductResponse> getAllProductsAdmin();
    void reactivateProduct(Long id);
    PageResponse<ProductResponse> getAdminProductsPaged(int page, int size);

}