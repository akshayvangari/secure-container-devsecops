package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(nullable = false, length = 500)
    private String repositoryUrl;

    @Column(length = 100)
    private String defaultBranch = "main";

    @Column(length = 500)
    private String workspacePath;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String language;

    @Column(length = 100)
    private String framework;

    private Integer securityScore = 100;
    private Integer criticalCount = 0;
    private Integer highCount = 0;
    private Integer mediumCount = 0;
    private Integer lowCount = 0;
    private Integer exposedSecretCount = 0;

    @Column(length = 50)
    private String pipelineStatus = "PASSED";

    @Column(length = 50)
    private String projectStatus = "ACTIVE";

    @Column(length = 50)
    private String serverStatus = "STOPPED";

    private Integer devServerPort;
    private Integer dependencyCount = 0;
    private Integer fileCount = 0;

    private Boolean hasDockerfile = false;
    private Boolean hasK8sManifest = false;
    private Boolean hasIac = false;

    private Instant lastScannedAt;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Project() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public String getDefaultBranch() { return defaultBranch; }
    public void setDefaultBranch(String defaultBranch) { this.defaultBranch = defaultBranch; }
    public String getWorkspacePath() { return workspacePath; }
    public void setWorkspacePath(String workspacePath) { this.workspacePath = workspacePath; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }
    public Integer getSecurityScore() { return securityScore; }
    public void setSecurityScore(Integer securityScore) { this.securityScore = securityScore; }
    public Integer getCriticalCount() { return criticalCount; }
    public void setCriticalCount(Integer criticalCount) { this.criticalCount = criticalCount; }
    public Integer getHighCount() { return highCount; }
    public void setHighCount(Integer highCount) { this.highCount = highCount; }
    public Integer getMediumCount() { return mediumCount; }
    public void setMediumCount(Integer mediumCount) { this.mediumCount = mediumCount; }
    public Integer getLowCount() { return lowCount; }
    public void setLowCount(Integer lowCount) { this.lowCount = lowCount; }
    public Integer getExposedSecretCount() { return exposedSecretCount; }
    public void setExposedSecretCount(Integer exposedSecretCount) { this.exposedSecretCount = exposedSecretCount; }
    public String getPipelineStatus() { return pipelineStatus; }
    public void setPipelineStatus(String pipelineStatus) { this.pipelineStatus = pipelineStatus; }
    public String getProjectStatus() { return projectStatus; }
    public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }
    public String getServerStatus() { return serverStatus; }
    public void setServerStatus(String serverStatus) { this.serverStatus = serverStatus; }
    public Integer getDevServerPort() { return devServerPort; }
    public void setDevServerPort(Integer devServerPort) { this.devServerPort = devServerPort; }
    public Integer getDependencyCount() { return dependencyCount; }
    public void setDependencyCount(Integer dependencyCount) { this.dependencyCount = dependencyCount; }
    public Integer getFileCount() { return fileCount; }
    public void setFileCount(Integer fileCount) { this.fileCount = fileCount; }
    public Boolean getHasDockerfile() { return hasDockerfile; }
    public void setHasDockerfile(Boolean hasDockerfile) { this.hasDockerfile = hasDockerfile; }
    public Boolean getHasK8sManifest() { return hasK8sManifest; }
    public void setHasK8sManifest(Boolean hasK8sManifest) { this.hasK8sManifest = hasK8sManifest; }
    public Boolean getHasIac() { return hasIac; }
    public void setHasIac(Boolean hasIac) { this.hasIac = hasIac; }
    public Instant getLastScannedAt() { return lastScannedAt; }
    public void setLastScannedAt(Instant lastScannedAt) { this.lastScannedAt = lastScannedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
