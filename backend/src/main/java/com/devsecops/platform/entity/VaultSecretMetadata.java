package com.devsecops.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vault_secret_metadata")
public class VaultSecretMetadata {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "project_id", length = 64)
    private String projectId;

    @Column(name = "secret_key", nullable = false, length = 150)
    private String secretKey;

    @Column(name = "secret_path", nullable = false, length = 255)
    private String secretPath;

    @Column(name = "secret_type", nullable = false, length = 100)
    private String secretType; // DATABASE, API_KEY, CERTIFICATE, CLOUD_CREDENTIAL, SSH_KEY

    @Column(name = "storage_backend", length = 100)
    private String storageBackend = "HashiCorp Vault KV v2";

    @Column(name = "current_version")
    private Integer currentVersion = 1;

    @Column(length = 50)
    private String status = "ACTIVE"; // ACTIVE, ROTATING, DEPRECATED, REVOKED

    @Column(name = "masked_value", nullable = false, length = 100)
    private String maskedValue;

    @Column(name = "last_rotated_at")
    private Instant lastRotatedAt = Instant.now();

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public VaultSecretMetadata() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getSecretPath() { return secretPath; }
    public void setSecretPath(String secretPath) { this.secretPath = secretPath; }
    public String getSecretType() { return secretType; }
    public void setSecretType(String secretType) { this.secretType = secretType; }
    public String getStorageBackend() { return storageBackend; }
    public void setStorageBackend(String storageBackend) { this.storageBackend = storageBackend; }
    public Integer getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(Integer currentVersion) { this.currentVersion = currentVersion; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMaskedValue() { return maskedValue; }
    public void setMaskedValue(String maskedValue) { this.maskedValue = maskedValue; }
    public Instant getLastRotatedAt() { return lastRotatedAt; }
    public void setLastRotatedAt(Instant lastRotatedAt) { this.lastRotatedAt = lastRotatedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
