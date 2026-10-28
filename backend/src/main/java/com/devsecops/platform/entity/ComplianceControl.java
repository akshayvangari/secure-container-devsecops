package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "compliance_controls")
public class ComplianceControl {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "framework_id", nullable = false, length = 50)
    private String frameworkId;

    @Column(name = "control_code", nullable = false, length = 100)
    private String controlCode;

    @Column(name = "control_name", nullable = false, length = 255)
    private String controlName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String requirements;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 20)
    private String severity = "HIGH";

    @Column(nullable = false, length = 50)
    private String status = "PASS"; // PASS, WARNING, FAIL, NOT_EVALUATED

    @Column(name = "technical_evidence", columnDefinition = "TEXT")
    private String technicalEvidence;

    @Column(name = "linked_project", length = 150)
    private String linkedProject;

    @Column(name = "remediation_guidance", columnDefinition = "TEXT")
    private String remediationGuidance;

    @Column(name = "last_evaluated_at")
    private Instant lastEvaluatedAt = Instant.now();

    public ComplianceControl() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFrameworkId() { return frameworkId; }
    public void setFrameworkId(String frameworkId) { this.frameworkId = frameworkId; }
    public String getControlCode() { return controlCode; }
    public void setControlCode(String controlCode) { this.controlCode = controlCode; }
    public String getControlName() { return controlName; }
    public void setControlName(String controlName) { this.controlName = controlName; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTechnicalEvidence() { return technicalEvidence; }
    public void setTechnicalEvidence(String technicalEvidence) { this.technicalEvidence = technicalEvidence; }
    public String getLinkedProject() { return linkedProject; }
    public void setLinkedProject(String linkedProject) { this.linkedProject = linkedProject; }
    public String getRemediationGuidance() { return remediationGuidance; }
    public void setRemediationGuidance(String remediationGuidance) { this.remediationGuidance = remediationGuidance; }
    public Instant getLastEvaluatedAt() { return lastEvaluatedAt; }
    public void setLastEvaluatedAt(Instant lastEvaluatedAt) { this.lastEvaluatedAt = lastEvaluatedAt; }
}
