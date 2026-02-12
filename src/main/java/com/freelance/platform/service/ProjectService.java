package com.freelance.platform.service;

import com.freelance.platform.dto.ProjectDTO;
import com.freelance.platform.entity.Project;
import com.freelance.platform.entity.User;
import com.freelance.platform.exception.ResourceNotFoundException;
import com.freelance.platform.exception.UnauthorizedException;
import com.freelance.platform.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

    public List<ProjectDTO.ProjectListResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO.ProjectListResponse> getProjectsByStatus(Project.ProjectStatus status) {
        return projectRepository.findByStatus(status).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO.ProjectListResponse> getCurrentUserProjects() {
        User currentUser = userService.getCurrentUser();
        return projectRepository.findByClient(currentUser).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    public ProjectDTO.ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDetailResponse(project);
    }

    @Transactional
    public ProjectDTO.ProjectResponse createProject(ProjectDTO.CreateProjectRequest request) {
        User currentUser = userService.getCurrentUser();

        if (!currentUser.getRole().equals(User.UserRole.CLIENT)) {
            throw new UnauthorizedException("Only clients can create projects");
        }

        Project project = new Project();
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudget(request.budget());
        project.setClient(currentUser);
        project.setStatus(Project.ProjectStatus.OPEN);

        Project savedProject = projectRepository.save(project);
        return mapToDetailResponse(savedProject);
    }

    @Transactional
    public ProjectDTO.ProjectResponse updateProject(Long id, ProjectDTO.UpdateProjectRequest request) {
        User currentUser = userService.getCurrentUser();
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!project.getClient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own projects");
        }

        if (request.title() != null) {
            project.setTitle(request.title());
        }

        if (request.description() != null) {
            project.setDescription(request.description());
        }

        if (request.budget() != null) {
            project.setBudget(request.budget());
        }

        if (request.status() != null) {
            project.setStatus(request.status());
            if (request.status().equals(Project.ProjectStatus.CLOSED) || 
                request.status().equals(Project.ProjectStatus.CANCELLED)) {
                project.setClosedAt(LocalDateTime.now());
            }
        }

        Project updatedProject = projectRepository.save(project);
        return mapToDetailResponse(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!project.getClient().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new UnauthorizedException("You can only delete your own projects");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDTO.ProjectResponse closeProject(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!project.getClient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only close your own projects");
        }

        project.setStatus(Project.ProjectStatus.CLOSED);
        project.setClosedAt(LocalDateTime.now());

        Project closedProject = projectRepository.save(project);
        return mapToDetailResponse(closedProject);
    }

    private ProjectDTO.ProjectResponse mapToDetailResponse(Project project) {
        return new ProjectDTO.ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getBudget().toString(),
                project.getClient().getId(),
                project.getClient().getUsername(),
                project.getStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                project.getClosedAt()
        );
    }

    private ProjectDTO.ProjectListResponse mapToListResponse(Project project) {
        return new ProjectDTO.ProjectListResponse(
                project.getId(),
                project.getTitle(),
                project.getBudget().toString(),
                project.getClient().getUsername(),
                project.getStatus(),
                project.getCreatedAt()
        );
    }
}
