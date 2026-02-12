package com.freelance.platform.dto;

import com.freelance.platform.entity.Project;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProjectDTO {

    public record CreateProjectRequest(
            @NotBlank(message = "Title is required")
            @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
            String title,

            @NotBlank(message = "Description is required")
            @Size(min = 20, message = "Description must be at least 20 characters")
            String description,

            @NotNull(message = "Budget is required")
            @DecimalMin(value = "1.00", message = "Budget must be at least 1.00")
            BigDecimal budget
    ) {}

    public record UpdateProjectRequest(
            @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
            String title,

            @Size(min = 20, message = "Description must be at least 20 characters")
            String description,

            @DecimalMin(value = "1.00", message = "Budget must be at least 1.00")
            BigDecimal budget,

            Project.ProjectStatus status
    ) {}

    public record ProjectResponse(
            Long id,
            String title,
            String description,
            String budget,
            Long clientId,
            String clientUsername,
            Project.ProjectStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime closedAt
    ) {}

    public record ProjectListResponse(
            Long id,
            String title,
            String budget,
            String clientUsername,
            Project.ProjectStatus status,
            LocalDateTime createdAt
    ) {}
}
