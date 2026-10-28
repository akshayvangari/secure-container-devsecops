package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pipeline_executions")
public class PipelineExecution {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "project_id", nullable = false, length = 64)
    private String projectId;

    @Column(name = "execution_number", nullable = false)
    private Integer executionNumber;

    @Column(nullable = false, length = 100)
    private String branch;

    @Column(name = "commit_hash", nullable = false, length = 64)
    private String commitHash;

    @Column(name = "commit_message", length = 500)
    private String commitMessage;

    @Column(name = "triggered_by", nullable = false, length = 100)
    private String triggeredBy;

    @Column(nullable = false, length = 50)
    private String status = "QUEUED"; // QUEUED, RUNNING, PASSED, FAILED, CANCELLED

    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;

    @Column(name = "security_gate_passed")
    private Boolean securityGatePassed = true;

    @Column(name = "blocked_reason", columnDefinition = "TEXT")
    private String blockedReason;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "executionId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("stageOrder ASC")
    private List<PipelineStage> stages = new ArrayList<>();

    public PipelineExecution() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public Integer getExecutionNumber() { return executionNumber; }
    public void setExecutionNumber(Integer executionNumber) { this.executionNumber = executionNumber; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public Boolean getSecurityGatePassed() { return securityGatePassed; }
    public void setSecurityGatePassed(Boolean securityGatePassed) { this.securityGatePassed = securityGatePassed; }
    public String getBlockedReason() { return blockedReason; }
    public void setBlockedReason(String blockedReason) { this.blockedReason = blockedReason; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<PipelineStage> getStages() { return stages; }
    public void setStages(List<PipelineStage> stages) { this.stages = stages; }
}
