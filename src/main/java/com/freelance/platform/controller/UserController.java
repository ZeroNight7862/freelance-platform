package com.freelance.platform.controller;

import com.freelance.platform.dto.UserDTO;
import com.freelance.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO.UserListResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    @GetMapping("/me")
    public ResponseEntity<UserDTO.UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO.UserProfileResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO.UserProfileResponse> updateCurrentUser(
            @Valid @RequestBody UserDTO.UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateCurrentUser(request));
    }


    @PutMapping("/{id}")
    public ResponseEntity<UserDTO.UserProfileResponse> updateUserById(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUserById(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
