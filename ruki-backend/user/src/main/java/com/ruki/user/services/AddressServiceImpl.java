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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    /* 
        Método para crear una nueva dirección, pero solo puedes 
        crear direcciones para tu propio ID (o si eres ADMIN)
    */
    @Override
    public AddressResponse createAddress(AddressCreate addressCreate) {

        /* 
            Cierre de vulnerabilidad IDOR
        */
        validateAddressOwnershipOrAdmin(addressCreate.getUserId());

        User user = userRepository.findByIdAndIsActiveTrue(addressCreate.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para asociar la dirección"));

        Address address = new Address();
        address.setStreet(addressCreate.getStreet());
        address.setCity(addressCreate.getCity());
        address.setRegion(addressCreate.getRegion());
        address.setZipCode(addressCreate.getZipCode());
        address.setReferenceInfo(addressCreate.getReferenceInfo());
        address.setUser(user);

        Address savedAddress = addressRepository.save(address);
        return toResponse(savedAddress);
    }

    /*
        Obtener direcciones de un usuario, pero 
        solo puedes ver tus propias direcciones
    */
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(Long userId) {

        /* 
            Cierre de vulnerabilidad IDOR
        */
        validateAddressOwnershipOrAdmin(userId); 

        if (!userRepository.existsByIdAndIsActiveTrue(userId)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }

        return addressRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAllAddresses() {
        return addressRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Actualizar una dirección solo si te pertenece
    */
    @Override
    public AddressResponse updateAddress(Long addressId, AddressUpdate addressUpdate) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        /* 
            Cierre de vulnerabilidad IDOR
        */
        validateAddressOwnershipOrAdmin(address.getUser().getId()); 

        if (!address.getUser().isActive()) {
            throw new ForbiddenOperationException("No se puede actualizar una dirección de un usuario inactivo");
        }

        if (addressUpdate.getStreet() != null) {
            address.setStreet(addressUpdate.getStreet());
        }
        if (addressUpdate.getCity() != null) {
            address.setCity(addressUpdate.getCity());
        }
        if (addressUpdate.getRegion() != null) {
            address.setRegion(addressUpdate.getRegion());
        }
        if (addressUpdate.getZipCode() != null) {
            address.setZipCode(addressUpdate.getZipCode());
        }
        if (addressUpdate.getReferenceInfo() != null) {
            address.setReferenceInfo(addressUpdate.getReferenceInfo());
        }

        Address updatedAddress = addressRepository.save(address);
        return toResponse(updatedAddress);
    }

    /*
        Eliminar una dirección solo si te pertenece
    */
    @Override
    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        /* 
            Cierre de vulnerabilidad IDOR
        */
        validateAddressOwnershipOrAdmin(address.getUser().getId()); 

        if (!address.getUser().isActive()) {
            throw new ForbiddenOperationException("No se puede eliminar una dirección de un usuario inactivo");
        }

        addressRepository.delete(address);
    }

    /*
        Método auxiliar para convertir una entidad user
        en un objeto de respuesta AddressResponse
    */
    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getStreet(),
                address.getCity(),
                address.getRegion(),
                address.getZipCode(),
                address.getReferenceInfo(),
                address.getUser().getId() 
        );
    }

    /*
        Método de seguridad que verifica si el usuario autenticado
        tiene permisos para gestionar direcciones de este ID
    */
    private void validateAddressOwnershipOrAdmin(Long targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return; 

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
        if (isAdmin) return;

        String currentUserEmail = auth.getName();
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para validar permisos"));

        if (!targetUser.getEmail().equals(currentUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: No eres el propietario de esta dirección");
        }
    }

}