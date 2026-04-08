package com.ruki.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruki.user.auth.AuthRequest;
import com.ruki.user.entities.Role;
import com.ruki.user.entities.User;
import com.ruki.user.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();


    @Test
    void login_ValidCredentials_ReturnsTokenAndUser() throws Exception {
        // 1. Arrange: Creamos un usuario de mentira en nuestra base de datos simulada
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("jaime@gmail.com");
        mockUser.setPassword(passwordEncoder.encode("supersecreta123")); // Encriptamos la clave para que el login funcione
        mockUser.setFirstName("Jaime");
        mockUser.setLastName("Hermosilla");
        mockUser.setRole(Role.ADMIN);
        mockUser.setActive(true);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(userRepository.findByEmailAndIsActiveTrue(anyString())).thenReturn(Optional.of(mockUser));

        // 2. Preparamos la petición que mandará Postman/React
        AuthRequest request = new AuthRequest();
        request.setEmail("jaime@gmail.com");
        request.setPassword("supersecreta123");

        // 3. Act & Assert: Disparamos y verificamos
        mockMvc.perform(post("/api-ruki/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()) // Esperamos un 200 OK
                .andExpect(jsonPath("$.token").exists()) // Validamos que el JWT se generó
                .andExpect(jsonPath("$.user.email").value("jaime@gmail.com")) // Validamos que traiga los datos
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    // --- LOS TESTS QUE YA TENÍAMOS ---
    @Test
    void login_InvalidCredentials_ReturnsUnauthorizedStatus() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("hacker@gmail.com");
        request.setPassword("wrongpassword");

        // Simulamos que el usuario no existe en BD
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api-ruki/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Correo electrónico o contraseña incorrectos"));
    }

    @Test
    void getMyProfile_MissingJwtToken_ReturnsUnauthorizedStatus() throws Exception {
        mockMvc.perform(get("/api-ruki/users/me"))
                .andExpect(status().isUnauthorized());
    }
}