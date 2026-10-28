package com.devsecops.platform.service;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.ProjectRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SecurityFindingRepository findingRepository;

    public ProjectService(ProjectRepository projectRepository, SecurityFindingRepository findingRepository) {
        this.projectRepository = projectRepository;
        this.findingRepository = findingRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Optional<Project> getProjectBySlug(String slug) {
        return projectRepository.findBySlug(slug);
    }

    public Project createProject(Project project) {
        if (project.getId() == null || project.getId().isBlank()) {
            project.setId("proj-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (project.getSlug() == null || project.getSlug().isBlank()) {
            project.setSlug(project.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    public Project updateProject(String id, Project updated) {
        return projectRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setRepositoryUrl(updated.getRepositoryUrl());
            existing.setDefaultBranch(updated.getDefaultBranch());
            existing.setWorkspacePath(updated.getWorkspacePath());
            existing.setDescription(updated.getDescription());
            existing.setLanguage(updated.getLanguage());
            existing.setFramework(updated.getFramework());
            existing.setHasDockerfile(updated.getHasDockerfile());
            existing.setHasK8sManifest(updated.getHasK8sManifest());
            existing.setHasIac(updated.getHasIac());
            existing.setUpdatedAt(Instant.now());
            return projectRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }

    /**
     * Documented Security Score Algorithm:
     * Base Score = 100
     * Deductions:
     * - Each CRITICAL finding: -15 pts
     * - Each HIGH finding: -8 pts
     * - Each MEDIUM finding: -3 pts
     * - Each LOW finding: -1 pt
     * - Exposed hardcoded secret: -20 pts
     * Floor: 0, Ceiling: 100
     */
    public int calculateSecurityScore(String projectId) {
        List<SecurityFinding> findings = findingRepository.findByProjectId(projectId);
        int score = 100;
        int critical = 0;
        int high = 0;
        int medium = 0;
        int low = 0;
        int secrets = 0;

        for (SecurityFinding f : findings) {
            if ("RESOLVED".equalsIgnoreCase(f.getRemediationStatus()) || "SUPPRESSED".equalsIgnoreCase(f.getRemediationStatus())) {
                continue;
            }
            if ("SECRET".equalsIgnoreCase(f.getCategory())) {
                secrets++;
                score -= 20;
            } else if ("CRITICAL".equalsIgnoreCase(f.getSeverity())) {
                critical++;
                score -= 15;
            } else if ("HIGH".equalsIgnoreCase(f.getSeverity())) {
                high++;
                score -= 8;
            } else if ("MEDIUM".equalsIgnoreCase(f.getSeverity())) {
                medium++;
                score -= 3;
            } else if ("LOW".equalsIgnoreCase(f.getSeverity())) {
                low++;
                score -= 1;
            }
        }

        score = Math.max(0, Math.min(100, score));

        Optional<Project> projOpt = projectRepository.findById(projectId);
        if (projOpt.isPresent()) {
            Project proj = projOpt.get();
            proj.setSecurityScore(score);
            proj.setCriticalCount(critical);
            proj.setHighCount(high);
            proj.setMediumCount(medium);
            proj.setLowCount(low);
            proj.setExposedSecretCount(secrets);
            proj.setUpdatedAt(Instant.now());
            projectRepository.save(proj);
        }

        return score;
    }
}
