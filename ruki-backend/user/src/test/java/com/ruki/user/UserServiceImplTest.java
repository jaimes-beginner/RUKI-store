package com.ruki.user;

import com.ruki.user.entities.Role;
import com.ruki.user.entities.User;
import com.ruki.user.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class UserServiceImplTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    // TEST 1: Verificar el perfil con un token válido (Rol Customer)
    @Test
    @WithMockUser(username = "cliente@gmail.com", roles = "CUSTOMER") // Magia: Finge que ya iniciamos sesión
    void getMyProfile_WithValidToken_ReturnsUserProfile() throws Exception {
        // Arrange
        User mockUser = new User();
        mockUser.setId(2L);
        mockUser.setEmail("cliente@gmail.com");
        mockUser.setFirstName("Juan");
        mockUser.setLastName("Pérez");
        mockUser.setRole(Role.CUSTOMER);
        mockUser.setActive(true);

        when(userRepository.findByEmailAndIsActiveTrue(anyString())).thenReturn(Optional.of(mockUser));

        // Act & Assert
        mockMvc.perform(get("/api-ruki/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("cliente@gmail.com"))
                .andExpect(jsonPath("$.firstName").value("Juan"));
    }

    // TEST 2: Intentar entrar al panel de Admin siendo Customer (Debe dar 403 Forbidden)
    @Test
    @WithMockUser(username = "cliente@gmail.com", roles = "CUSTOMER")
    void getAllUsersForAdmin_AsCustomer_ReturnsForbiddenStatus() throws Exception {
        // Act & Assert: El guardia debe patearlo por no tener el rol ADMIN
        mockMvc.perform(get("/api-ruki/users/admin/all"))
                .andExpect(status().isForbidden());
    }

    // TEST 3: Entrar al panel de Admin siendo Admin (Debe dar 200 OK)
    @Test
    @WithMockUser(username = "admin@ruki.com", roles = "ADMIN")
    void getAllUsersForAdmin_AsAdmin_ReturnsOkStatus() throws Exception {
        // Act & Assert: El guardia debe dejarlo pasar
        mockMvc.perform(get("/api-ruki/users/admin/all"))
                .andExpect(status().isOk());
    }
}