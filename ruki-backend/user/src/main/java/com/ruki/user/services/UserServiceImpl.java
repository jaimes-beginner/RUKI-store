package com.ruki.user.services;

import com.ruki.user.entities.Role;
import com.ruki.user.entities.User;
import com.ruki.user.exceptions.ForbiddenOperationException;
import com.ruki.user.exceptions.ResourceConflictException;
import com.ruki.user.exceptions.ResourceNotFoundException;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.PageResponse;
import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /*
        Método para crear un nuevo usuario, se asegura que el email no esté registrado
    */
    @Override
    public UserResponse createUser(UserCreate userCreate) {
        if (userRepository.existsByEmail(userCreate.getEmail())) {
            throw new ResourceConflictException("El correo electrónico ya está registrado.");
        }

        User user = User.builder() 
                .email(userCreate.getEmail())
                .password(passwordEncoder.encode(userCreate.getPassword()))
                .firstName(userCreate.getFirstName())
                .lastName(userCreate.getLastName())
                .role(Role.CUSTOMER)
                .isActive(true) 
                .build();

        User savedUser = userRepository.save(user);
        log.info("Usuario creado con ID {} y email {}", savedUser.getId(), savedUser.getEmail());
        return toResponse(savedUser);
    }

    /*
        Método para obtener un usuario por su ID, solo si está activo
    */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        validateOwnershipOrAdmin(id);

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado o inactivo."));
        log.debug("Usuario con ID {} encontrado.", id);
        return toResponse(user);
    }

    /*
        Método para obtener un usuario por su email, solo si está activo
    */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado o inactivo."));

        validateOwnershipOrAdmin(user.getId()); 
        log.debug("Usuario con email {} encontrado.", email);
        return toResponse(user);
    }

    /*
        Método para obtener todos los usuarios activos
    */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllActiveUsers() {
        log.debug("Obteniendo todos los usuarios activos.");
        return userRepository.findAllByIsActive(true)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para obtener todos los usuarios
    */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.info("Obteniendo todos los usuarios para el administrador.");
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Método para actualizar un usuario, solo si el 
        usuario autenticado es el mismo o un ADMIN
    */
    @Override
    public UserResponse updateUser(Long id, UserUpdate userUpdate) {
        validateOwnershipOrAdmin(id);

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado o inactivo."));

        /*
            Aplicar actualizaciones solo si los campos no son nulos
        */
        Optional.ofNullable(userUpdate.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(userUpdate.getLastName()).ifPresent(user::setLastName);

        /*
            Codificar la contraseña si se proporciona
        */
        Optional.ofNullable(userUpdate.getPassword())
                .map(passwordEncoder::encode) 
                .ifPresent(user::setPassword);

        User updatedUser = userRepository.save(user);
        log.info("Usuario con ID {} actualizado.", updatedUser.getId());
        return toResponse(updatedUser);
    }

    /*
        Método para eliminar (desactivar) un usuario, solo si el 
        usuario autenticado es el mismo o un ADMIN
    */
    @Override
    public void deleteUser(Long id) {
        validateOwnershipOrAdmin(id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (!user.isActive()) {

            /*
                Ya está inactivo, no hacer nada
            */
            log.warn("Intento de eliminar usuario con ID {} que ya estaba inactivo.", id);
            return; 
        }

        user.setActive(false);
        userRepository.save(user);
        log.info("Usuario con ID {} desactivado (soft delete).", id);
    }

    /*
        Método para reactivar un usuario, solo si el 
        usuario autenticado es el mismo o un ADMIN
    */
    @Override
    public void reactivateUser(Long id) {
        validateOwnershipOrAdmin(id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (user.isActive()) {

            /*
                Ya está activo, no hacer nada
            */
            log.warn("Intento de reactivar usuario con ID {} que ya estaba activo.", id);
            return; 
        }

        user.setActive(true);
        userRepository.save(user);
        log.info("Usuario con ID {} reactivado.", id);
    }

    // MÉTODO PARA OBTENER A LOS USUARIOS ACTIVOS CON PAGINACIÓN
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllActiveUsers(int page, int size) {
        log.debug("Obteniendo usuarios activos paginados.");
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> userPage = userRepository.findAllByIsActive(true, pageRequest);
        
        List<UserResponse> content = userPage.getContent().stream().map(this::toResponse).toList();
        
        return PageResponse.<UserResponse>builder()
                .content(content).pageNumber(userPage.getNumber()).pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements()).totalPages(userPage.getTotalPages()).last(userPage.isLast())
                .build();
    }

    // MÉTODO PARA OBTENER A TODOS LOS USUARIOS CON PAGINACIÓN (ADMIN)
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        log.info("Obteniendo todos los usuarios paginados para el administrador.");
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> userPage = userRepository.findAll(pageRequest);
        
        List<UserResponse> content = userPage.getContent().stream().map(this::toResponse).toList();
        
        return PageResponse.<UserResponse>builder()
                .content(content).pageNumber(userPage.getNumber()).pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements()).totalPages(userPage.getTotalPages()).last(userPage.isLast())
                .build();
    }

    /*
        Método auxiliar para convertir una entidad 
        User en un objeto de respuesta UserResponse
    */
    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /*
        Método de seguridad que verifica si el usuario autenticado
        tiene permisos para modificar el recurso solicitado.
    */
    private void validateOwnershipOrAdmin(Long targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
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

        if (!targetUser.getId().equals(targetUserId)) {
            log.warn("Acceso denegado: Usuario {} intentó acceder a recurso de usuario {}", currentUserEmail, targetUserId);
            throw new ForbiddenOperationException("Acceso denegado: No eres el propietario de esta cuenta.");
        }
        log.debug("Acceso concedido a propietario para el usuario {}", targetUserId);
    }
    
}