package com.freelance.platform.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final Map<Long, Map<String, Object>> projects = new HashMap<>();
    private Long currentId = 1L;

    @GetMapping
    public List<Map<String, Object>> getAllProjects() {
        return new ArrayList<>(projects.values());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProjectById(@PathVariable Long id) {
        Map<String, Object> project = projects.get(id);
        if (project == null) {
            return Map.of(
                    "error", true,
                    "message", "Project not found",
                    "id", id
            );
        }
        return project;
    }

    @PostMapping
    public Map<String, Object> createProject(@RequestBody Map<String, String> projectData) {
        Long id = currentId++;

        Map<String, Object> project = new HashMap<>();
        project.put("id", id);
        project.put("title", projectData.getOrDefault("title", "Project " + id));
        project.put("description", projectData.getOrDefault("description", ""));
        project.put("budget", projectData.getOrDefault("budget", "0"));
        project.put("clientId", projectData.getOrDefault("clientId", "1"));
        project.put("status", "OPEN");
        project.put("createdAt", new Date().toString());

        projects.put(id, project);

        return Map.of(
                "success", true,
                "message", "Project created",
                "project", project
        );
    }

    @PutMapping("/{id}/close")
    public Map<String, Object> closeProject(@PathVariable Long id) {
        if (!projects.containsKey(id)) {
            return Map.of("error", true, "message", "Project not found");
        }

        Map<String, Object> project = projects.get(id);
        project.put("status", "CLOSED");
        project.put("closedAt", new Date().toString());

        return Map.of(
                "success", true,
                "message", "Project closed",
                "project", project
        );
    }
}