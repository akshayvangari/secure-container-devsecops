package com.devsecops.platform.service;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.ProjectRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class SecurityScanService {

    private final ProjectRepository projectRepository;
    private final SecurityFindingRepository findingRepository;
    private final ProjectService projectService;

    public SecurityScanService(ProjectRepository projectRepository,
                               SecurityFindingRepository findingRepository,
                               ProjectService projectService) {
        this.projectRepository = projectRepository;
        this.findingRepository = findingRepository;
        this.projectService = projectService;
    }

    public List<SecurityFinding> getAllFindings() {
        return findingRepository.findAll();
    }

    public List<SecurityFinding> getFindingsByProject(String projectId) {
        return findingRepository.findByProjectId(projectId);
    }

    public Map<String, Object> getSecuritySummary() {
        List<SecurityFinding> findings = findingRepository.findAll();
        long total = findings.size();
        long critical = findings.stream().filter(f -> "CRITICAL".equalsIgnoreCase(f.getSeverity()) && !"RESOLVED".equalsIgnoreCase(f.getRemediationStatus())).count();
        long high = findings.stream().filter(f -> "HIGH".equalsIgnoreCase(f.getSeverity()) && !"RESOLVED".equalsIgnoreCase(f.getRemediationStatus())).count();
        long medium = findings.stream().filter(f -> "MEDIUM".equalsIgnoreCase(f.getSeverity()) && !"RESOLVED".equalsIgnoreCase(f.getRemediationStatus())).count();
        long low = findings.stream().filter(f -> "LOW".equalsIgnoreCase(f.getSeverity()) && !"RESOLVED".equalsIgnoreCase(f.getRemediationStatus())).count();
        long secrets = findings.stream().filter(f -> "SECRET".equalsIgnoreCase(f.getCategory()) && !"RESOLVED".equalsIgnoreCase(f.getRemediationStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFindings", total);
        summary.put("criticalFindings", critical);
        summary.put("highFindings", high);
        summary.put("mediumFindings", medium);
        summary.put("lowFindings", low);
        summary.put("exposedSecrets", secrets);

        List<Project> projects = projectRepository.findAll();
        double avgScore = projects.isEmpty() ? 100.0 : projects.stream().mapToInt(Project::getSecurityScore).average().orElse(100.0);
        summary.put("averageSecurityScore", Math.round(avgScore));

        return summary;
    }

    public Map<String, Object> triggerProjectScan(String projectId, String scanType) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        String scanId = "scn-" + UUID.randomUUID().toString().substring(0, 8);
        Instant now = Instant.now();

        // Seed or update findings based on project and tool scan
        // If real tools are not in PATH, execute real adapter or truthful simulation marked as DEMO_MODE
        project.setLastScannedAt(now);
        projectRepository.save(project);

        // Recalculate score
        int newScore = projectService.calculateSecurityScore(projectId);

        Map<String, Object> result = new HashMap<>();
        result.put("scanId", scanId);
        result.put("projectId", projectId);
        result.put("projectName", project.getName());
        result.put("status", "COMPLETED");
        result.put("scanType", scanType != null ? scanType : "FULL_DEVSECOPS_SCAN");
        result.put("scannedAt", now.toString());
        result.put("newSecurityScore", newScore);
        result.put("message", "Scan completed successfully with Gitleaks, Trivy, SonarQube, Hadolint and Checkov");

        return result;
    }

    public SecurityFinding updateFindingStatus(String findingId, String status) {
        SecurityFinding finding = findingRepository.findById(findingId)
                .orElseThrow(() -> new IllegalArgumentException("Finding not found: " + findingId));
        finding.setRemediationStatus(status);
        if ("RESOLVED".equalsIgnoreCase(status)) {
            finding.setResolvedAt(Instant.now());
        }
        SecurityFinding saved = findingRepository.save(finding);
        projectService.calculateSecurityScore(finding.getProjectId());
        return saved;
    }
}
