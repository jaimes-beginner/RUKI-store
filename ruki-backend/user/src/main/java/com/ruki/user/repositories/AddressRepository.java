package com.ruki.user.repositories;

import com.ruki.user.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional; 

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /*
        Obtener todas las direcciones activas de un usuario por su ID
    */
    List<Address> findByUserIdAndActiveTrue(Long userId);

    /*
        Obtener todas las direcciones (activas e inactivas) de un usuario por su ID
    */
    List<Address> findByUserId(Long userId);

    /*
        Obtener una dirección específica por su ID y el ID del usuario al que pertenece
    */
    Optional<Address> findByIdAndUserId(Long addressId, Long userId);

}