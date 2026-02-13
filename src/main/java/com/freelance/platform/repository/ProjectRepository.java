// src/main/java/com/freelance/platform/repository/ProjectRepository.java
package com.freelance.platform.repository;

import com.freelance.platform.entity.Project;
import com.freelance.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByClient(User client);

    List<Project> findByStatus(Project.ProjectStatus status);

    List<Project> findByClientAndStatus(User client, Project.ProjectStatus status);
}