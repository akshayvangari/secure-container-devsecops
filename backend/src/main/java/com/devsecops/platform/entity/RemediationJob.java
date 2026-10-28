package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "remediation_jobs")
public class RemediationJob {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "finding_id", nullable = false, length = 64)
    private String findingId;

    @Column(name = "package_name", nullable = false, length = 150)
    private String packageName;

    @Column(name = "previous_version", nullable = false, length = 100)
    private String previousVersion;

    @Column(name = "proposed_version", nullable = false, length = 100)
    private String proposedVersion;

    @Column(name = "target_branch", length = 100)
    private String targetBranch = "main";

    @Column(name = "remediation_branch", nullable = false, length = 150)
    private String remediationBranch;

    @Column(name = "diff_content", columnDefinition = "TEXT")
    private String diffContent;

    @Column(nullable = false, length = 50)
    private String status = "PROPOSED"; // PROPOSED, APPROVED, TESTING, PR_CREATED, MERGED, REJECTED, FAILED

    @Column(name = "compatibility_warning", columnDefinition = "TEXT")
    private String compatibilityWarning;

    @Column(name = "test_run_status", length = 50)
    private String testRunStatus;

    @Column(name = "github_pr_number")
    private Integer githubPrNumber;

    @Column(name = "github_pr_url", length = 500)
    private String githubPrUrl;

    @Column(name = "remediation_log", columnDefinition = "TEXT")
    private String remediationLog;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public RemediationJob() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getFindingId() { return findingId; }
    public void setFindingId(String findingId) { this.findingId = findingId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public String getPreviousVersion() { return previousVersion; }
    public void setPreviousVersion(String previousVersion) { this.previousVersion = previousVersion; }
    public String getProposedVersion() { return proposedVersion; }
    public void setProposedVersion(String proposedVersion) { this.proposedVersion = proposedVersion; }
    public String getTargetBranch() { return targetBranch; }
    public void setTargetBranch(String targetBranch) { this.targetBranch = targetBranch; }
    public String getRemediationBranch() { return remediationBranch; }
    public void setRemediationBranch(String remediationBranch) { this.remediationBranch = remediationBranch; }
    public String getDiffContent() { return diffContent; }
    public void setDiffContent(String diffContent) { this.diffContent = diffContent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCompatibilityWarning() { return compatibilityWarning; }
    public void setCompatibilityWarning(String compatibilityWarning) { this.compatibilityWarning = compatibilityWarning; }
    public String getTestRunStatus() { return testRunStatus; }
    public void setTestRunStatus(String testRunStatus) { this.testRunStatus = testRunStatus; }
    public Integer getGithubPrNumber() { return githubPrNumber; }
    public void setGithubPrNumber(Integer githubPrNumber) { this.githubPrNumber = githubPrNumber; }
    public String getGithubPrUrl() { return githubPrUrl; }
    public void setGithubPrUrl(String githubPrUrl) { this.githubPrUrl = githubPrUrl; }
    public String getRemediationLog() { return remediationLog; }
    public void setRemediationLog(String remediationLog) { this.remediationLog = remediationLog; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
