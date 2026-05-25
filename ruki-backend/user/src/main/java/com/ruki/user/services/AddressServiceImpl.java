package com.ruki.user.services;

import com.ruki.user.entities.Address;
import com.ruki.user.entities.User;
import com.ruki.user.exceptions.ForbiddenOperationException;
import com.ruki.user.exceptions.ResourceNotFoundException;
import com.ruki.user.repositories.AddressRepository;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.AddressCreate;
import com.ruki.user.requests.AddressResponse;
import com.ruki.user.requests.AddressUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional; 

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j 
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    /*
        Método para crear una nueva dirección
    */
    @Override
    public AddressResponse createAddress(AddressCreate addressCreate) {
        
        /*
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(addressCreate.getUserId());

        User user = userRepository.findByIdAndIsActiveTrue(addressCreate.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado o inactivo para asociar la dirección."));

        Address address = Address.builder() 
                .street(addressCreate.getStreet())
                .city(addressCreate.getCity())
                .region(addressCreate.getRegion())
                .zipCode(addressCreate.getZipCode())
                .referenceInfo(addressCreate.getReferenceInfo())
                .user(user)
                .active(true)
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("Dirección creada con ID {} para el usuario {}", savedAddress.getId(), user.getId());
        return toResponse(savedAddress);
    }

    /*
        Método para obtener todas las direcciones activas de un usuario por su ID
    */
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getActiveAddressesByUserId(Long userId) {
        validateOwnershipOrAdmin(userId);
        
        /*
            Verificar si el usuario existe y está activo antes de buscar direcciones
        */
        if (!userRepository.existsByIdAndIsActiveTrue(userId)) {
            throw new ResourceNotFoundException("Usuario no encontrado o inactivo.");
        }
        return addressRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener todas las direcciones (activas e inactivas) 
        de un usuario por su ID, solo para ADMIN
    */
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAllAddresses() {
        
        /*
            No se necesita validación de rol aquí, ya que el 
            SecurityConfig o @PreAuthorize lo manejarán
        */
        log.info("Obteniendo todas las direcciones para el administrador.");
        return addressRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para actualizar una dirección existente
    */
    @Override
    public AddressResponse updateAddress(Long addressId, AddressUpdate addressUpdate) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada."));

        /*
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(address.getUser().getId());

        if (!address.getUser().isActive()) {
            throw new ForbiddenOperationException("No se puede actualizar una dirección de un usuario inactivo.");
        }

        /*
            Aplicar actualizaciones solo si los campos no son nulos
        */
        Optional.ofNullable(addressUpdate.getStreet()).ifPresent(address::setStreet);
        Optional.ofNullable(addressUpdate.getCity()).ifPresent(address::setCity);
        Optional.ofNullable(addressUpdate.getRegion()).ifPresent(address::setRegion);
        Optional.ofNullable(addressUpdate.getZipCode()).ifPresent(address::setZipCode);
        Optional.ofNullable(addressUpdate.getReferenceInfo()).ifPresent(address::setReferenceInfo);

        Address updatedAddress = addressRepository.save(address);
        log.info("Dirección con ID {} actualizada para el usuario {}", updatedAddress.getId(), updatedAddress.getUser().getId());
        return toResponse(updatedAddress);
    }

    /*
        Método para eliminar (soft delete) una dirección por su ID
    */
    @Override
    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada."));

        /*
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(address.getUser().getId());

        if (!address.getUser().isActive()) {
            throw new ForbiddenOperationException("No se puede eliminar una dirección de un usuario inactivo.");
        }

        /*
            Si ya estaba inactiva, no hacemos nada
        */
        if (!address.isActive()) {
            log.warn("Intento de eliminar dirección con ID {} que ya estaba inactiva.", addressId);
            return; 
        }

        address.setActive(false);
        addressRepository.save(address);
        log.info("Dirección con ID {} desactivada (soft delete) para el usuario {}", addressId, address.getUser().getId());
    }

    /*
        Método para obtener todas las direcciones (activas e inactivas) 
        de un usuario por su ID, para el propio usuario o ADMIN
    */
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(Long userId) {
        validateOwnershipOrAdmin(userId);

        if (!userRepository.existsByIdAndIsActiveTrue(userId)) {
            throw new ResourceNotFoundException("Usuario no encontrado o inactivo.");
        }

        return addressRepository.findByUserId(userId) 
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método auxiliar para convertir una entidad Address 
        en un objeto de respuesta AddressResponse
    */
    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .region(address.getRegion())
                .zipCode(address.getZipCode())
                .referenceInfo(address.getReferenceInfo())
                .userId(address.getUser().getId())
                .build();
    }

    /*
        Método de seguridad que verifica si el usuario autenticado
        tiene permisos para gestionar direcciones de este ID
    */
    private void validateOwnershipOrAdmin(Long targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) { // Verificar si hay autenticación activa
            log.warn("Intento de acceso sin autenticación en validateOwnershipOrAdmin.");
            throw new ForbiddenOperationException("Acceso denegado: No autenticado.");
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            log.debug("Acceso concedido a ADMIN para el usuario {}", targetUserId);
            return;
        }

        String currentUserEmail = auth.getName();
        User targetUser = userRepository.findByEmail(currentUserEmail) 
                .orElseThrow(() -> {
                    log.error("Usuario autenticado {} no encontrado en la base de datos.", currentUserEmail);
                    return new ResourceNotFoundException("Usuario autenticado no encontrado.");
                });

        if (!targetUser.getId().equals(targetUserId)) { // Comparar IDs
            log.warn("Acceso denegado: Usuario {} intentó acceder a recurso de usuario {}", currentUserEmail, targetUserId);
            throw new ForbiddenOperationException("Acceso denegado: No eres el propietario de este recurso.");
        }
        log.debug("Acceso concedido a propietario para el usuario {}", targetUserId);
    }
    
}