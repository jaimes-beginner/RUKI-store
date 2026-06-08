package com.ruki.user.repositories;

import com.ruki.user.entities.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // MÉTODO PARA OBTENER A LOS USUARIOS ACTIVOS O INACTIVOS CON PAGINACIÓN
    Page<User> findAllByIsActive(boolean isActive, Pageable pageable);

    /*
        Método para buscar a un usuario por su correo electrónico (activo o inactivo)
    */
    Optional<User> findByEmail(String email);

    /*
        Método para buscar a un usuario por su correo electrónico y que esté activo
    */
    Optional<User> findByEmailAndIsActiveTrue(String email);

    /*
        Método para buscar a un usuario por su ID y que esté activo
    */
    Optional<User> findByIdAndIsActiveTrue(Long id);

    /*
        Método para verificar si un usuario existe por su ID y está activo
    */
    boolean existsByIdAndIsActiveTrue(Long id);

    /*
        Método para obtener a todos los usuarios activos o inactivos
    */
    List<User> findAllByIsActive(boolean isActive);

    /*
        Método para buscar a un usuario por su token de recuperación de contraseña
    */
    Optional<User> findByResetPasswordToken(String token);

    /*
        Método para verificar si un correo electrónico ya existe en el sistema (activo o inactivo)
    */
    boolean existsByEmail(String email);
    
}