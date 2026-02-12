package com.freelance.platform.dto;

import com.freelance.platform.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDTO {

    public record RegisterRequest(
            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
            String username,

            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password,

            @NotNull(message = "Role is required")
            User.UserRole role
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record AuthResponse(
            String token,
            UserResponse user
    ) {}

    public record UserResponse(
            Long id,
            String username,
            String email,
            User.UserRole role,
            String balance,
            String avatarUrl
    ) {}
}
