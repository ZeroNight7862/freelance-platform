package com.freelance.platform.service;

import com.freelance.platform.dto.AuthDTO;
import com.freelance.platform.entity.User;
import com.freelance.platform.exception.BadRequestException;
import com.freelance.platform.repository.UserRepository;
import com.freelance.platform.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setBalance(BigDecimal.ZERO);
        user.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.username());

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthDTO.AuthResponse(token, mapToUserResponse(savedUser));
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthDTO.AuthResponse(token, mapToUserResponse(user));
    }

    private AuthDTO.UserResponse mapToUserResponse(User user) {
        return new AuthDTO.UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getBalance().toString(),
                user.getAvatarUrl()
        );
    }
}
