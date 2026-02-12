package com.freelance.platform.controller;

import com.freelance.platform.dto.AuthDTO;
import com.freelance.platform.service.AuthService;
import com.freelance.platform.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        AuthDTO.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDTO.UserResponse> getCurrentUser() {
        var userProfile = userService.getCurrentUserProfile();
        AuthDTO.UserResponse response = new AuthDTO.UserResponse(
                userProfile.id(),
                userProfile.username(),
                userProfile.email(),
                userProfile.role(),
                userProfile.balance(),
                userProfile.avatarUrl()
        );
        return ResponseEntity.ok(response);
    }
}
