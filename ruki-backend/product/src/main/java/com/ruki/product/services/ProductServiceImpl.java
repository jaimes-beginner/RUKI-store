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

    /*
        Método para crear un producto.
    */
    @Override
    public ProductResponse createProduct(ProductCreate request) {

        /*
            Buscamos que la categoría exista
            antes de asociarle el producto
        */
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
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    /*
        Método para listar todos los productos activos.
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener todos los
        productos de una categoría específica.
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findAllByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener un producto por su ID.
    */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        return toResponse(product);
    }

    /*
        Método para desactivar un producto por su ID.
    */
    @Override
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        product.setActive(false);
        productRepository.save(product);
    }

    /*
        Método privado para envolver el Producto y
        su Categoría en los DTOs correspondientes.
    */
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
                catResponse
        );
    }

}
