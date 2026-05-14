package com.ruki.product.services;

import com.ruki.product.entities.Category;
import com.ruki.product.entities.Product;
import com.ruki.product.entities.ProductVariant;
import com.ruki.product.repositories.CategoryRepository;
import com.ruki.product.repositories.ProductRepository;
import com.ruki.product.requests.CategoryResponse;
import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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
        Método para crear un producto
    */
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
        product.setImageUrls(request.getImageUrls());
        product.setBasePrice(request.getBasePrice());
        product.setCategory(category);
        
        /*
            Asignando los nuevos campos para las ofertas
        */
        product.setSale(request.isSale());
        product.setSalePrice(request.getSalePrice());

        /*
            Procesar las tallas y calcular el stock total
        */
        int totalStock = 0;
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (ProductCreate.VariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setSize(variantReq.getSize());
                variant.setStock(variantReq.getStock());
                variant.setProduct(product); 
                
                product.getVariants().add(variant);
                totalStock += variantReq.getStock(); 
            }
        } else {

            /*
                Si por alguna razón mandan un producto sin tallas, usamos 
                el stock general que viene en el request
            */
            totalStock = request.getStock() != null ? request.getStock() : 0;
        }

        /*
            Sincronizar el stock general 
        */
        product.setStock(totalStock);

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    /* 
        Método para obtener todos los productos activos
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
        Método para obtener productos según su categoría
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
        Método para obtener un producto por su ID
    */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        return toResponse(product);
    }

    /* 
        Método para desactivar un producto por su ID
    */
    @Override
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));
        product.setActive(false);
        productRepository.save(product);
    }

    /* 
        Método para descontar stock de un producto
    */
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

    /* 
        Método para actualizar un producto
    */
    @Override
    public ProductResponse updateProduct(Long id, ProductUpdate request) {
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Producto no encontrado"));


        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getImageUrls() != null) {
            product.getImageUrls().clear();
            product.getImageUrls().addAll(request.getImageUrls());
        }
        if (request.getBasePrice() != null) {
            product.setBasePrice(request.getBasePrice());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoría no encontrada"));
            
            if (!category.isActive()) {
                throw new ResponseStatusException(BAD_REQUEST, "No se puede asignar un producto a una categoría inactiva");
            }
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }
    
    /* 
        Método para devolver stock (Rollback de compras fallidas)
    */
    @Override
    public void addStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
    }



    /*
        Método parar obtener todos los productos 
        recientes para los ARRIVALS
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals() {
        return productRepository.findTop12ByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener todos los productos en oferta
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getSaleProducts() {
        return productRepository.findAllByIsActiveTrueAndIsSaleTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener productos según los 
        parámetros de filtrado dinámico
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> filterProducts(Long categoryId, String size, BigDecimal minPrice, BigDecimal maxPrice, String sort) {

        /*
            Orden por defecto, lo productos 
            más nuevos van primero
        */
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
        
        /*
            Lógica de ordenamiento dinámico
        */
        if ("priceAsc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.ASC, "basePrice");
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.DESC, "basePrice");
        }

        return productRepository.findFilteredProducts(categoryId, size, minPrice, maxPrice, sortOrder)
                .stream()
                .map(this::toResponse) 
                .toList();
    }

    /*
        Método auxiliar para convertir una entidad 
        Product a un ProductResponse
    */
    private ProductResponse toResponse(Product product) {
        CategoryResponse catResponse = new CategoryResponse(
                product.getCategory().getId(),
                product.getCategory().getName()
        );
        
        /*
            Mapear lsa variantes, las tallas
        */
        List<ProductResponse.VariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> new ProductResponse.VariantResponse(v.getId(), v.getSize(), v.getStock()))
                .toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImageUrls(),
                product.getBasePrice(),
                product.getStock(), 
                catResponse,
                product.isActive(),
                product.getCreatedAt(),
                product.isSale(),
                product.getSalePrice(),
                variantResponses
        );
    }

}