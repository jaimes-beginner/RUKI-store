package com.ruki.user.repositories;

import com.ruki.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /*
        Método para buscar a un usuario 
        por su correo electrónico
    */
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByIdAndIsActiveTrue(Long id);
    boolean existsByIdAndIsActiveTrue(Long id);

    /*
        Método para obtener a todos
        los usuarios activos o inactivos
    */
    List<User> findAllByIsActive(boolean isActive);
}
