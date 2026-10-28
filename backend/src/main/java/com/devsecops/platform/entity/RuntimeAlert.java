package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "runtime_alerts")
public class RuntimeAlert {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "rule_name", nullable = false, length = 200)
    private String ruleName;

    @Column(nullable = false, length = 20)
    private String severity; // CRITICAL, HIGH, WARNING, INFO

    @Column(name = "pod_name", nullable = false, length = 150)
    private String podName;

    @Column(name = "container_name", length = 150)
    private String containerName;

    @Column(nullable = false, length = 100)
    private String namespace = "production";

    @Column(name = "cluster_name", length = 100)
    private String clusterName = "prod-k8s-cluster-01";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_metadata", columnDefinition = "JSONB")
    private String eventMetadata;

    private Boolean acknowledged = false;

    @Column(name = "acknowledged_by", length = 100)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    private Instant timestamp = Instant.now();

    public RuntimeAlert() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getPodName() { return podName; }
    public void setPodName(String podName) { this.podName = podName; }
    public String getContainerName() { return containerName; }
    public void setContainerName(String containerName) { this.containerName = containerName; }
    public String getNamespace() { return namespace; }
    public void setNamespace(String namespace) { this.namespace = namespace; }
    public String getClusterName() { return clusterName; }
    public void setClusterName(String clusterName) { this.clusterName = clusterName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEventMetadata() { return eventMetadata; }
    public void setEventMetadata(String eventMetadata) { this.eventMetadata = eventMetadata; }
    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
