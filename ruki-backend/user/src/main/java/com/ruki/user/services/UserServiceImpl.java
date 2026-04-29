package com.ruki.user.services;

import com.ruki.user.entities.Role;
import com.ruki.user.entities.User;
import com.ruki.user.exceptions.ResourceConflictException;
import com.ruki.user.exceptions.ResourceNotFoundException;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    /*
        Inyección de dependencias del respositorio 
        y el encoder de contraseñas
    */
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /*
        Crear un nuevo usuario verificando que 
        el correo electrónico no esté registrado

        Todo usuario nuevo se fuerza al rol CUSTOMER
    */
    @Override
    public UserResponse createUser(UserCreate userCreate) {
        if (userRepository.findByEmail(userCreate.getEmail()).isPresent()) {
            throw new ResourceConflictException("El correo electrónico ya está registrado");
        }

        User user = new User();
        user.setEmail(userCreate.getEmail());
        user.setPassword(passwordEncoder.encode(userCreate.getPassword()));
        user.setFirstName(userCreate.getFirstName());
        user.setLastName(userCreate.getLastName());
        user.setRole(Role.CUSTOMER); 
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    /*
        Obtener un usuario por su ID, lanzando
        una excepción si no se encuentra. (Protegido por IDOR)
    */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {

        /* 
            Bloqueamos la lectura cruzada por ID
        */
        validateOwnershipOrAdmin(id); 

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return toResponse(user);
    }

    /*
        Obtener un usuario por su correo electrónico 
        lanzando una excepción si no se encuentra. (Protegido por IDOR)
    */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        /* 
            Bloqueamos la lectura cruzada por Email
        */
        validateOwnershipOrAdmin(user.getId()); 
        
        return toResponse(user);
    }

    /*
        Obtener todos los usuarios activos
        filtrando por isActivo = true
    */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllActiveUsers() {
        return userRepository.findAllByIsActive(true)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Obtener todos los usuarios 
        sin filtrar por estado
    */
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
        Actualizar a un usuario existente, permitiendo
        la actualización parcial de los campos, ya que
        todos son opcionales. (Protegido por IDOR)
    */
    @Override
    public UserResponse updateUser(Long id, UserUpdate userUpdate) {

        /* 
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(id); 

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (userUpdate.getFirstName() != null) {
            user.setFirstName(userUpdate.getFirstName());
        }
        if (userUpdate.getLastName() != null) {
            user.setLastName(userUpdate.getLastName());
        }
        if (userUpdate.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    /*
        Eliminar un usuario realizando una baja lógica
        cambiando solo el estado del usuario. (Protegido por IDOR)
    */
    @Override
    public void deleteUser(Long id) {

        /*
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(id); 

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!user.isActive()) {
            return;
        }

        user.setActive(false);
        userRepository.save(user);
    }

    /*
        Método auxiliar para convertir una entidad user
        en un objeto de respuesta UserResponse
    */
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    /*
        Método de seguridad que verifica si el usuario autenticado
        tiene permisos para modificar el recurso solicitado.
    */
    private void validateOwnershipOrAdmin(Long targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return; 

        /*
            Si es ADMIN, tiene paso libre
        */
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        /*
            Si es CUSTOMER, validamos que su correo 
            coincida con el correo del ID a modificar
        */
        String currentUserEmail = auth.getName();
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para validar permisos"));

        if (!targetUser.getEmail().equals(currentUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: No eres el propietario de esta cuenta");
        }
    }

    /*
        Reactivar un usuario que previamente tuvo una baja lógica
        cambiando su estado a true. (Protegido por IDOR)
    */
    @Override
    public void reactivateUser(Long id) {
        
        /*
            Cierre de vulnerabilidad IDOR
        */
        validateOwnershipOrAdmin(id); 

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.isActive()) {
            return; 
        }

        user.setActive(true);
        userRepository.save(user);
    }

}