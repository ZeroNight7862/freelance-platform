package com.freelance.platform.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final Map<Long, Map<String, Object>> orders = new HashMap<>();
    private Long currentId = 1L;

    @GetMapping
    public List<Map<String, Object>> getAllOrders() {
        return new ArrayList<>(orders.values());
    }

    @PostMapping
    public Map<String, Object> createOrder(@RequestBody Map<String, String> orderData) {
        Long id = currentId++;

        Map<String, Object> order = new HashMap<>();
        order.put("id", id);
        order.put("projectId", orderData.getOrDefault("projectId", ""));
        order.put("freelancerId", orderData.getOrDefault("freelancerId", ""));
        order.put("clientId", orderData.getOrDefault("clientId", ""));
        order.put("price", orderData.getOrDefault("price", "0"));
        order.put("status", "PENDING");
        order.put("createdAt", new Date().toString());

        orders.put(id, order);

        return Map.of(
                "success", true,
                "message", "Order created",
                "order", order
        );
    }

    @PutMapping("/{id}/complete")
    public Map<String, Object> completeOrder(@PathVariable Long id) {
        if (!orders.containsKey(id)) {
            return Map.of("error", true, "message", "Order not found");
        }

        Map<String, Object> order = orders.get(id);
        order.put("status", "COMPLETED");
        order.put("completedAt", new Date().toString());

        return Map.of(
                "success", true,
                "message", "Order completed",
                "order", order
        );
    }
}