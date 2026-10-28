package com.devsecops.platform;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.ProjectRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import com.devsecops.platform.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    private ProjectRepository projectRepository;
    private SecurityFindingRepository findingRepository;
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        findingRepository = mock(SecurityFindingRepository.class);
        projectService = new ProjectService(projectRepository, findingRepository);
    }

    @Test
    void testCalculateSecurityScore_perfectScoreWhenNoFindings() {
        String projId = "proj-1";
        Project proj = new Project();
        proj.setId(projId);

        when(findingRepository.findByProjectId(projId)).thenReturn(List.of());
        when(projectRepository.findById(projId)).thenReturn(Optional.of(proj));

        int score = projectService.calculateSecurityScore(projId);
        assertEquals(100, score);
    }

    @Test
    void testCalculateSecurityScore_deductsForCriticalAndSecret() {
        String projId = "proj-1";
        Project proj = new Project();
        proj.setId(projId);

        SecurityFinding f1 = new SecurityFinding();
        f1.setCategory("CVE");
        f1.setSeverity("CRITICAL");
        f1.setRemediationStatus("OPEN");

        SecurityFinding f2 = new SecurityFinding();
        f2.setCategory("SECRET");
        f2.setSeverity("CRITICAL");
        f2.setRemediationStatus("OPEN");

        when(findingRepository.findByProjectId(projId)).thenReturn(List.of(f1, f2));
        when(projectRepository.findById(projId)).thenReturn(Optional.of(proj));

        // Base 100 - 15 (critical) - 20 (secret) = 65
        int score = projectService.calculateSecurityScore(projId);
        assertEquals(65, score);
    }
}
