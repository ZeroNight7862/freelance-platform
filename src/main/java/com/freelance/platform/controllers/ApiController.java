package com.freelance.platform.controllers;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "app", "Freelance Platform API",
                "description", "Backend for freelance marketplace",
                "version", "1.0.0",
                "author", "2nd year college student",
                "status", "API is working",
                "timestamp", LocalDateTime.now().toString(),
                "database", "H2 (in-memory)",
                "endpoints", Map.of(
                        "GET    /api/", "This endpoint",
                        "GET    /api/status", "System status",
                        "GET    /api/users", "Users list",
                        "POST   /api/users", "Create user",
                        "GET    /h2-console", "Database console"
                )
        );
    }

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of(
                "status", "OK",
                "java_version", System.getProperty("java.version"),
                "spring_boot", "4.0.0",
                "timestamp", LocalDateTime.now().toString()
        );
    }

    @GetMapping("/test")
    public String test() {
        return "API is working. Time: " + LocalDateTime.now();
    }
}