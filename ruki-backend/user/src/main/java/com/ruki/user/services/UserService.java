package com.ruki.user.services;

import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import java.util.List;

public interface UserService {

    /* 
        Aquí se indican los métodos que tendrán si o si la 
        lógica de los usuarios, en este caso tiene el de crear 
        un usuario | obtener un usuario por su ID | obtener un 
        usuario por su correo electrónico | obtener todos los 
        usuarios activos | actualizar un usuario existente,
        eliminar un usuario y reactivar un usuario eliminado
    */

    UserResponse createUser(UserCreate userCreate);
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllActiveUsers();
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UserUpdate userUpdate);
    void deleteUser(Long id);
    void reactivateUser(Long id);

}
