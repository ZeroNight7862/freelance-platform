package com.freelance.platform.controller;

import com.freelance.platform.dto.ProjectDTO;
import com.freelance.platform.entity.Project;
import com.freelance.platform.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO.ProjectListResponse>> getAllProjects(
            @RequestParam(required = false) Project.ProjectStatus status) {
        
        List<ProjectDTO.ProjectListResponse> projects;
        
        if (status != null) {
            projects = projectService.getProjectsByStatus(status);
        } else {
            projects = projectService.getAllProjects();
        }
        
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectDTO.ProjectListResponse>> getCurrentUserProjects() {
        List<ProjectDTO.ProjectListResponse> projects = projectService.getCurrentUserProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO.ProjectResponse> getProjectById(@PathVariable Long id) {
        ProjectDTO.ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<ProjectDTO.ProjectResponse> createProject(
            @Valid @RequestBody ProjectDTO.CreateProjectRequest request) {
        ProjectDTO.ProjectResponse project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO.ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDTO.UpdateProjectRequest request) {
        ProjectDTO.ProjectResponse project = projectService.updateProject(id, request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ProjectDTO.ProjectResponse> closeProject(@PathVariable Long id) {
        ProjectDTO.ProjectResponse project = projectService.closeProject(id);
        return ResponseEntity.ok(project);
    }
}
