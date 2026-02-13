package com.freelance.platform.dto;

import com.freelance.platform.entity.Order;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDTO {

    public record CreateOrderRequest(
            @NotNull(message = "Project ID is required")
            Long projectId,

            @NotNull(message = "Freelancer ID is required")
            Long freelancerId,

            @NotNull(message = "Price is required")
            @DecimalMin(value = "1.00", message = "Price must be at least 1.00")
            BigDecimal price
    ) {}

    public record UpdateOrderStatusRequest(
            @NotNull(message = "Status is required")
            Order.OrderStatus status
    ) {}

    public record OrderResponse(
            Long id,
            Long projectId,
            String projectTitle,
            Long freelancerId,
            String freelancerUsername,
            Long clientId,
            String clientUsername,
            String price,
            Order.OrderStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime completedAt
    ) {}

    public record OrderListResponse(
            Long id,
            String projectTitle,
            String freelancerUsername,
            String clientUsername,
            String price,
            Order.OrderStatus status,
            LocalDateTime createdAt
    ) {}
}