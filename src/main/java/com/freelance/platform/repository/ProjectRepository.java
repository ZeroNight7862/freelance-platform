package com.freelance.platform.repository;

import com.freelance.platform.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    //save, findAll и т.д.
}