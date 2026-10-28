package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "kubernetes_pods")
public class KubernetesPod {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "pod_name", nullable = false, unique = true, length = 150)
    private String podName;

    @Column(nullable = false, length = 100)
    private String namespace = "production";

    @Column(name = "app_label", length = 100)
    private String appLabel;

    @Column(nullable = false, length = 50)
    private String status; // Running, CrashLoopBackOff, Pending, Completed

    @Column(nullable = false, length = 255)
    private String image;

    private Integer restarts = 0;

    @Column(name = "ready_replicas", length = 50)
    private String readyReplicas = "1/1";

    @Column(name = "cpu_cores", length = 50)
    private String cpuCores = "0.12 cores";

    @Column(name = "memory_mb", length = 50)
    private String memoryMb = "184 MB";

    @Column(name = "security_context_compliant")
    private Boolean securityContextCompliant = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public KubernetesPod() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPodName() { return podName; }
    public void setPodName(String podName) { this.podName = podName; }
    public String getNamespace() { return namespace; }
    public void setNamespace(String namespace) { this.namespace = namespace; }
    public String getAppLabel() { return appLabel; }
    public void setAppLabel(String appLabel) { this.appLabel = appLabel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Integer getRestarts() { return restarts; }
    public void setRestarts(Integer restarts) { this.restarts = restarts; }
    public String getReadyReplicas() { return readyReplicas; }
    public void setReadyReplicas(String readyReplicas) { this.readyReplicas = readyReplicas; }
    public String getCpuCores() { return cpuCores; }
    public void setCpuCores(String cpuCores) { this.cpuCores = cpuCores; }
    public String getMemoryMb() { return memoryMb; }
    public void setMemoryMb(String memoryMb) { this.memoryMb = memoryMb; }
    public Boolean getSecurityContextCompliant() { return securityContextCompliant; }
    public void setSecurityContextCompliant(Boolean securityContextCompliant) { this.securityContextCompliant = securityContextCompliant; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
