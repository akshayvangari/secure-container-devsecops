package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "security_findings")
public class SecurityFinding {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "scan_id", length = 64)
    private String scanId;

    @Column(nullable = false, length = 50)
    private String category; // CVE, SECRET, SAST, DOCKER, IAC, RUNTIME

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "cve_id", length = 100)
    private String cveId;

    @Column(name = "package_name", length = 150)
    private String packageName;

    @Column(name = "installed_version", length = 100)
    private String installedVersion;

    @Column(name = "fixed_version", length = 100)
    private String fixedVersion;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(nullable = false, length = 20)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW, INFO

    @Column(name = "cvss_score", precision = 4, scale = 1)
    private BigDecimal cvssScore;

    @Column(length = 50)
    private String exploitability;

    @Column(name = "tool_name", nullable = false, length = 100)
    private String toolName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "remediation_guidance", columnDefinition = "TEXT")
    private String remediationGuidance;

    @Column(name = "remediation_status", length = 50)
    private String remediationStatus = "OPEN"; // OPEN, IN_REVIEW, PATCH_PROPOSED, RESOLVED, SUPPRESSED

    @Column(name = "first_detected_at")
    private Instant firstDetectedAt = Instant.now();

    @Column(name = "last_detected_at")
    private Instant lastDetectedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public SecurityFinding() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getScanId() { return scanId; }
    public void setScanId(String scanId) { this.scanId = scanId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCveId() { return cveId; }
    public void setCveId(String cveId) { this.cveId = cveId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getInstalledVersion() { return installedVersion; }
    public void setInstalledVersion(String installedVersion) { this.installedVersion = installedVersion; }
    public String getFixedVersion() { return fixedVersion; }
    public void setFixedVersion(String fixedVersion) { this.fixedVersion = fixedVersion; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public BigDecimal getCvssScore() { return cvssScore; }
    public void setCvssScore(BigDecimal cvssScore) { this.cvssScore = cvssScore; }
    public String getExploitability() { return exploitability; }
    public void setExploitability(String exploitability) { this.exploitability = exploitability; }
    public String getToolName() { return toolName; }
    public void setToolName(String toolName) { this.toolName = toolName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRemediationGuidance() { return remediationGuidance; }
    public void setRemediationGuidance(String remediationGuidance) { this.remediationGuidance = remediationGuidance; }
    public String getRemediationStatus() { return remediationStatus; }
    public void setRemediationStatus(String remediationStatus) { this.remediationStatus = remediationStatus; }
    public Instant getFirstDetectedAt() { return firstDetectedAt; }
    public void setFirstDetectedAt(Instant firstDetectedAt) { this.firstDetectedAt = firstDetectedAt; }
    public Instant getLastDetectedAt() { return lastDetectedAt; }
    public void setLastDetectedAt(Instant lastDetectedAt) { this.lastDetectedAt = lastDetectedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
