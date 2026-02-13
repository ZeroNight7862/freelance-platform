package com.freelance.platform.dto;

import com.freelance.platform.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UserDTO {

    public record UpdateUserRequest(
            @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
            String username,

            @Email(message = "Email must be valid")
            String email,

            String fullName,

            String phone,

            String avatarUrl
    ) {}

    public record UserProfileResponse(
            Long id,
            String username,
            String email,
            User.UserRole role,
            String balance,
            String avatarUrl,
            String fullName,
            String phone,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record UserListResponse(
            Long id,
            String username,
            String email,
            User.UserRole role,
            String avatarUrl
    ) {}
}