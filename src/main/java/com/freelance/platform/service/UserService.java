package com.freelance.platform.service;

import com.freelance.platform.dto.UserDTO;
import com.freelance.platform.entity.User;
import com.freelance.platform.exception.BadRequestException;
import com.freelance.platform.exception.ResourceNotFoundException;
import com.freelance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTO.UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return mapToProfileResponse(user);
    }

    public UserDTO.UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToProfileResponse(user);
    }

    public List<UserDTO.UserListResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO.UserProfileResponse updateCurrentUser(UserDTO.UpdateUserRequest request) {
        User user = getCurrentUser();

        if (request.username() != null) {
            if (!request.username().equals(user.getUsername()) && 
                userRepository.existsByUsername(request.username())) {
                throw new BadRequestException("Username already exists");
            }
            user.setUsername(request.username());
        }

        if (request.email() != null) {
            if (!request.email().equals(user.getEmail()) && 
                userRepository.existsByEmail(request.email())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.email());
        }

        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }

        if (request.phone() != null) {
            user.setPhone(request.phone());
        }

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        if (request.bio() != null) {
            user.setBio(request.bio());
        }

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }


    @Transactional
    public UserDTO.UserProfileResponse updateUserById(Long id, UserDTO.UpdateUserRequest request) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(id) && !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new BadRequestException("You can only update your own profile");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.username() != null) {
            if (!request.username().equals(user.getUsername()) && userRepository.existsByUsername(request.username())) {
                throw new BadRequestException("Username already exists");
            }
            user.setUsername(request.username());
        }

        if (request.email() != null) {
            if (!request.email().equals(user.getEmail()) && userRepository.existsByEmail(request.email())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.email());
        }

        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl());
        if (request.bio() != null) user.setBio(request.bio());

        return mapToProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User currentUser = getCurrentUser();
        
        if (!currentUser.getId().equals(id) && !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new BadRequestException("You can only delete your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        userRepository.delete(user);
    }

    private UserDTO.UserProfileResponse mapToProfileResponse(User user) {
        return new UserDTO.UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getBalance().toString(),
                user.getAvatarUrl(),
                user.getFullName(),
                user.getPhone(),
                user.getBio(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private UserDTO.UserListResponse mapToListResponse(User user) {
        return new UserDTO.UserListResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl()
        );
    }
}
