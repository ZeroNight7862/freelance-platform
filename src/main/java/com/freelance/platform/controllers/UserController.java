package com.freelance.platform.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final Map<Long, Map<String, Object>> users = new HashMap<>();
    private Long currentId = 1L;

    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getUserById(@PathVariable Long id) {
        Map<String, Object> user = users.get(id);
        if (user == null) {
            return Map.of(
                    "error", true,
                    "message", "User not found",
                    "id", id
            );
        }
        return user;
    }

    @PostMapping
    public Map<String, Object> createUser(@RequestBody Map<String, String> userData) {
        Long id = currentId++;

        Map<String, Object> user = new HashMap<>();
        user.put("id", id);
        user.put("username", userData.getOrDefault("username", "user" + id));
        user.put("email", userData.getOrDefault("email", "user" + id + "@mail.ru"));
        user.put("role", userData.getOrDefault("role", "FREELANCER"));
        user.put("fullName", userData.getOrDefault("fullName", ""));
        user.put("createdAt", new Date().toString());
        user.put("updatedAt", new Date().toString());

        users.put(id, user);

        return Map.of(
                "success", true,
                "message", "User created successfully",
                "user", user,
                "id", id
        );
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id,
                                          @RequestBody Map<String, String> updates) {
        if (!users.containsKey(id)) {
            return Map.of(
                    "error", true,
                    "message", "User not found"
            );
        }

        Map<String, Object> user = users.get(id);
        updates.forEach((key, value) -> {
            if (!key.equals("id")) {
                user.put(key, value);
            }
        });
        user.put("updatedAt", new Date().toString());

        return Map.of(
                "success", true,
                "message", "User updated",
                "user", user
        );
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        if (!users.containsKey(id)) {
            return Map.of(
                    "error", true,
                    "message", "User not found"
            );
        }

        users.remove(id);
        return Map.of(
                "success", true,
                "message", "User deleted successfully"
        );
    }
}