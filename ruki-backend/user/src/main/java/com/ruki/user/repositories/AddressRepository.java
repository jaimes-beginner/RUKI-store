package com.ruki.user.repositories;

import com.ruki.user.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    /* 
        Obtener todas las direcciones 
        que tiene un usuario por su ID
    */
    List<Address> findAllByUserId(Long userId);
}