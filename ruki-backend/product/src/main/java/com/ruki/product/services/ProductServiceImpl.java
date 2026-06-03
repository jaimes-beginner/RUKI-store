package com.ruki.product.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ruki.product.entities.Category;
import com.ruki.product.entities.Product;
import com.ruki.product.entities.ProductVariant;
import com.ruki.product.exceptions.ResourceConflictException; 
import com.ruki.product.exceptions.ResourceNotFoundException; 
import com.ruki.product.repositories.CategoryRepository;
import com.ruki.product.repositories.ProductRepository;
import com.ruki.product.requests.CategoryResponse;
import com.ruki.product.requests.ProductCreate;
import com.ruki.product.requests.ProductResponse;
import com.ruki.product.requests.ProductUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; 
import org.springframework.data.domain.PageRequest; 
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j 
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductCreate request) {

        /*
            Buscar una categoria activa
        */
        Category category = categoryRepository.findByIdAndIsActiveTrue(request.getCategoryId()) 
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada o inactiva con ID: " + request.getCategoryId()));

        Product product = Product.builder() 
                .name(request.getName())
                .description(request.getDescription())
                .imageUrls(new ArrayList<>(request.getImageUrls())) 
                .basePrice(request.getBasePrice())
                .category(category)
                .isSale(request.isSale())
                .salePrice(request.getSalePrice())
                .isActive(true) 
                .variants(new ArrayList<>())
                .build();

        /*
            Procesar las tallas y calcular el stock total
        */
        int totalStock = 0;
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (ProductCreate.VariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder() 
                        .size(variantReq.getSize())
                        .stock(variantReq.getStock())
                        .product(product)
                        .build();
                product.getVariants().add(variant);
                totalStock += variantReq.getStock();
            }
        } else {
            
            /*
                Si no hay variantes, el stock general es el del request (si se proporciona)
            */
            totalStock = request.getStock() != null ? request.getStock() : 0;
            log.warn("Producto '{}' creado sin variantes. Stock general establecido en {}.", request.getName(), totalStock);
        }

        /*
            Sincronizar el stock general
        */
        product.setStock(totalStock); 

        Product saved = productRepository.save(product);
        log.info("Producto creado con ID {} y nombre '{}' en categoría {}. Stock total: {}", saved.getId(), saved.getName(), category.getName(), saved.getStock());
        return toResponse(saved);
    }

    /*
        Método para obtener todos los productos activos
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        log.debug("Obteniendo todos los productos activos.");
        return productRepository.findAllByIsActiveTrue()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /*
        Método para obtener productos por categoría (solo activos)
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        
        /*
            Verificar si la categoría existe y está activa antes de buscar productos
        */
        if (!categoryRepository.findByIdAndIsActiveTrue(categoryId).isPresent()) {
            throw new ResourceNotFoundException("Categoría no encontrada o inactiva con ID: " + categoryId);
        }
        log.debug("Obteniendo productos activos para la categoría con ID {}.", categoryId);
        return productRepository.findAllByCategoryIdAndIsActiveTrue(categoryId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    /*
        Método para obtener un producto por su ID (solo si está activo)
    */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id) 
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado o inactivo con ID: " + id));
        log.debug("Producto con ID {} encontrado.", id);
        
        ProductResponse response = toResponse(product);

        try {
            ObjectMapper tempMapper = new ObjectMapper();
            tempMapper.registerModule(new JavaTimeModule());
            tempMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            log.info("PRODUCT | JSON de salida para producto {}: {}", id, tempMapper.writeValueAsString(response));
        } catch (Exception e) {
            log.error("PRODUCT | Error al serializar ProductResponse para log: {}", e.getMessage());
        }

    return response;
}

    /*
        Método para desactivar (soft delete) un producto
    */
    @Override
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (!product.isActive()) {
            log.warn("Intento de desactivar producto con ID {} que ya estaba inactivo.", id);
            return;
        }

        product.setActive(false);
        productRepository.save(product);
        log.info("Producto con ID {} desactivado (soft delete).", id);
    }

    /*
        Método para descontar stock de un producto
    */
    @Override
    @Transactional
    public void discountStock(Long id, Integer quantity, String size) {
        Product product = productRepository.findByIdAndIsActiveTrue(id) 
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado o inactivo con ID: " + id));

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            
            /*
                Descontar de la variante específica
            */
            ProductVariant variant = product.getVariants().stream()
                    .filter(v -> v.getSize().equalsIgnoreCase(size))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Talla '" + size + "' no encontrada para el producto con ID: " + id));

            if (variant.getStock() < quantity) {
                throw new ResourceConflictException("Stock insuficiente (" + variant.getStock() + ") en la talla '" + size + "' para el producto con ID: " + id);
            }
            variant.setStock(variant.getStock() - quantity);
            log.debug("Stock de variante '{}' para producto {} descontado en {}. Nuevo stock: {}", size, id, quantity, variant.getStock());
        } else {
            
            /*
                Descontar del stock general si no hay variantes
            */
            if (product.getStock() < quantity) {
                throw new ResourceConflictException("Stock general insuficiente (" + product.getStock() + ") para el producto con ID: " + id);
            }
        }

        /*
            Siempre descontamos el stock general para mantener la compatibilidad
        */
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
        log.info("Stock general para producto {} descontado en {}. Nuevo stock total: {}", id, quantity, product.getStock());
    }

    /*
        Método para actualizar un producto existente
    */
    @Override
    public ProductResponse updateProduct(Long id, ProductUpdate request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        /*
            Actualizar campos si se proporcionan
        */
        Optional.ofNullable(request.getName()).ifPresent(product::setName);
        Optional.ofNullable(request.getDescription()).ifPresent(product::setDescription);
        Optional.ofNullable(request.getImageUrls()).ifPresent(newImageUrls -> {
            product.getImageUrls().clear();
            product.getImageUrls().addAll(newImageUrls);
        });
        Optional.ofNullable(request.getBasePrice()).ifPresent(product::setBasePrice);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndIsActiveTrue(request.getCategoryId()) 
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada o inactiva con ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Optional.ofNullable(request.getIsSale()).ifPresent(product::setSale);
        Optional.ofNullable(request.getSalePrice()).ifPresent(product::setSalePrice);

        /*
            Lógica para actualizar tallas y el stock
        */
        if (request.getVariants() != null) {

            /*
                Asegurarse de que la lista de variantes 
                no sea null antes de limpiarla
            */
            if (product.getVariants() == null) {
                product.setVariants(new ArrayList<>());
            }

            /*
                Limpiamos las tallas viejas 
                (orphanRemoval las borrará de la DB)
            */
            product.getVariants().clear(); 
            int totalStock = 0;
            for (ProductCreate.VariantRequest variantReq : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .size(variantReq.getSize())
                        .stock(variantReq.getStock())
                        .product(product)
                        .build();
                product.getVariants().add(variant);
                totalStock += variantReq.getStock();
            }
            product.setStock(totalStock); 
            log.debug("Variantes y stock total para producto {} actualizados. Nuevo stock: {}", id, totalStock);
        } else if (request.getStock() != null) {
            
            /*
                Si no enviaron tallas, pero enviaron stock 
                general (por si es un producto sin talla)
            */
            product.setStock(request.getStock());
            log.debug("Stock general para producto {} actualizado a {}.", id, request.getStock());
        }

        Product updated = productRepository.save(product);
        log.info("Producto con ID {} actualizado.", updated.getId());
        return toResponse(updated);
    }

    /*
        Método para añadir stock a un producto
    */
    @Override
    @Transactional
    public void addStock(Long id, Integer quantity, String size) {

        Product product = productRepository.findById(id) 
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            
            /*
                Devolver stock a la variante específica
            */
            product.getVariants().stream()
                    .filter(v -> v.getSize().equalsIgnoreCase(size))
                    .findFirst()
                    .ifPresentOrElse(
                            variant -> {
                                variant.setStock(variant.getStock() + quantity);
                                log.debug("Stock de variante '{}' para producto {} añadido en {}. Nuevo stock: {}", size, id, quantity, variant.getStock());
                            },
                            () -> log.warn("Talla '{}' no encontrada para el producto con ID {}. No se pudo añadir stock a la variante.", size, id)
                    );
                    
        }

        /*
            Devolvemos el stock general
        */
        product.setStock(product.getStock() + quantity);
        productRepository.save(product);
        log.info("Stock general para producto {} añadido en {}. Nuevo stock total: {}", id, quantity, product.getStock());
    }

    /*
        Método para obtener los últimos productos agregados (New Arrivals)
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals() {
        log.debug("Obteniendo los últimos 12 productos activos (New Arrivals).");
        
        /*
            Usar el método con Pageable para mayor 
            flexibilidad, aunque aquí sea fijo a 12
        */
        return productRepository.findByIsActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, 12))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener productos en oferta (isSale = true)
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getSaleProducts() {
        log.debug("Obteniendo todos los productos activos en oferta.");
        return productRepository.findAllByIsActiveTrueAndIsSaleTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para filtrar productos por categoría, talla, rango de precio y ordenamiento
    */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> filterProducts(Long categoryId, String size, BigDecimal minPrice, BigDecimal maxPrice, String sort) {
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt"); 

        if ("priceAsc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.ASC, "basePrice");
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.DESC, "basePrice");
        }
        log.debug("Filtrando productos con categoryId: {}, size: {}, minPrice: {}, maxPrice: {}, sort: {}", categoryId, size, minPrice, maxPrice, sort);
        return productRepository.findFilteredProducts(categoryId, size, minPrice, maxPrice, sortOrder)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método auxiliar para convertir una entidad Product a un ProductResponse
    */
    private ProductResponse toResponse(Product product) {
        CategoryResponse catResponse = CategoryResponse.builder() 
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .build();

        List<ProductResponse.VariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> ProductResponse.VariantResponse.builder() 
                        .id(v.getId())
                        .size(v.getSize())
                        .stock(v.getStock())
                        .build())
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .imageUrls(product.getImageUrls())
                .basePrice(product.getBasePrice())
                .stock(product.getStock())
                .category(catResponse)
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .isSale(product.isSale())
                .salePrice(product.getSalePrice())
                .variants(variantResponses)
                .build();
    }
    
}