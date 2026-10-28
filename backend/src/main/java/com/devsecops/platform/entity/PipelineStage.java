package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pipeline_stages")
public class PipelineStage {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "execution_id", nullable = false, length = 64)
    private String executionId;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "tool_name", length = 100)
    private String toolName;

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, RUNNING, PASSED, FAILED, SKIPPED

    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;

    @Column(name = "is_gate")
    private Boolean isGate = false;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    public PipelineStage() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getExecutionId() { return executionId; }
    public void setExecutionId(String executionId) { this.executionId = executionId; }
    public Integer getStageOrder() { return stageOrder; }
    public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getToolName() { return toolName; }
    public void setToolName(String toolName) { this.toolName = toolName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public Boolean getIsGate() { return isGate; }
    public void setIsGate(Boolean isGate) { this.isGate = isGate; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
}
