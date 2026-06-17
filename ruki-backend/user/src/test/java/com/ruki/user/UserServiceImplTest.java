package com.ruki.user;

import com.ruki.user.entities.Role;
import com.ruki.user.entities.User;
import com.ruki.user.exceptions.ResourceConflictException;
import com.ruki.user.repositories.UserRepository;
import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.services.UserServiceImpl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("ÉXITO: Debe crear un usuario si el correo no existe")
    void createUser_Success() {
        // Arrange
        UserCreate request = new UserCreate("nuevo@ruki.com", "123456", "Juan", "Perez");
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });

        // Act
        UserResponse response = userService.createUser(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("nuevo@ruki.com", response.getEmail());
        assertEquals(Role.CUSTOMER, response.getRole());
        assertTrue(response.isActive());
    }

    @Test
    @DisplayName("ERROR: Debe rechazar la creación si el correo ya existe")
    void createUser_ThrowsException_WhenEmailExists() {
        // Arrange
        UserCreate request = new UserCreate("duplicado@ruki.com", "123456", "Juan", "Perez");
        
        // Simulamos que la base de datos dice "Sí, ya existe"
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(ResourceConflictException.class, () -> {
            userService.createUser(request);
        });

        // Verificamos que no se intentó encriptar ni guardar nada
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }
}