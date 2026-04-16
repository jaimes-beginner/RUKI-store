package com.ruki.product.services;

import com.ruki.product.entities.Category;
import com.ruki.product.entities.Product;
import com.ruki.product.repositories.CategoryRepository;
import com.ruki.product.repositories.ProductRepository;
import com.ruki.product.requests.CategoryResponse;
import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductCreate request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));

        if (!category.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "No se puede agregar productos a una categoría inactiva");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setMainImageUrl(request.getMainImageUrl());
        product.setBasePrice(request.getBasePrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findAllByIsActiveTrue()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findAllByCategoryIdAndIsActiveTrue(categoryId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        return toResponse(product);
    }

    @Override
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    public void discountStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        
        if (!product.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "El producto está inactivo");
        }

        if (product.getStock() < quantity) {
            throw new ResponseStatusException(BAD_REQUEST, "Stock insuficiente para el producto: " + product.getName());
        }

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    private ProductResponse toResponse(Product product) {
        CategoryResponse catResponse = new CategoryResponse(
                product.getCategory().getId(),
                product.getCategory().getName()
        );
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getMainImageUrl(),
                product.getBasePrice(),
                product.getStock(),
                catResponse,
                product.isActive()
        );
    }

}