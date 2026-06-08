package com.ruki.user.services;

import com.ruki.user.requests.PageResponse;
import com.ruki.user.requests.UserCreate;
import com.ruki.user.requests.UserResponse;
import com.ruki.user.requests.UserUpdate;
import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreate userCreate);
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllActiveUsers();
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UserUpdate userUpdate);
    void deleteUser(Long id);
    void reactivateUser(Long id);
    PageResponse<UserResponse> getAllActiveUsers(int page, int size);
    PageResponse<UserResponse> getAllUsersPaged(int page, int size);

}