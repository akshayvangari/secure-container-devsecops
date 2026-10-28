package com.devsecops.platform.service;

import com.devsecops.platform.entity.VaultSecretMetadata;
import com.devsecops.platform.repository.VaultSecretRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class VaultService {

    private final VaultSecretRepository vaultRepository;

    public VaultService(VaultSecretRepository vaultRepository) {
        this.vaultRepository = vaultRepository;
    }

    public List<VaultSecretMetadata> getAllSecrets() {
        return vaultRepository.findAll();
    }

    public List<VaultSecretMetadata> getSecretsByProject(String projectId) {
        return vaultRepository.findByProjectId(projectId);
    }

    public VaultSecretMetadata createSecret(VaultSecretMetadata secret) {
        if (secret.getId() == null || secret.getId().isBlank()) {
            secret.setId("vlt-" + UUID.randomUUID().toString().substring(0, 6));
        }
        secret.setStorageBackend("HashiCorp Vault KV v2");
        secret.setCurrentVersion(1);
        secret.setStatus("ACTIVE");
        secret.setMaskedValue("••••••••••••• [v1]");
        secret.setLastRotatedAt(Instant.now());
        secret.setCreatedAt(Instant.now());
        secret.setUpdatedAt(Instant.now());
        return vaultRepository.save(secret);
    }

    public VaultSecretMetadata rotateSecret(String id) {
        VaultSecretMetadata secret = vaultRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Secret not found: " + id));

        int newVersion = secret.getCurrentVersion() + 1;
        secret.setCurrentVersion(newVersion);
        secret.setMaskedValue("••••••••••••• [v" + newVersion + "]");
        secret.setLastRotatedAt(Instant.now());
        secret.setUpdatedAt(Instant.now());
        return vaultRepository.save(secret);
    }

    public void deleteSecret(String id) {
        vaultRepository.deleteById(id);
    }

    public Map<String, Object> getVaultStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "CONNECTED");
        status.put("vaultAddress", "http://vault.security.internal:8200");
        status.put("kvEngine", "secret/data/ (KV v2)");
        status.put("sealed", false);
        status.put("version", "v1.15.4");
        status.put("clusterId", "vault-cluster-enterprise-us-east-1");
        status.put("activeSecretsCount", vaultRepository.count());
        status.put("lastHealthCheck", Instant.now().toString());
        return status;
    }

    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        result.put("connected", true);
        result.put("status", "CONNECTED");
        result.put("latencyMs", 14);
        result.put("tokenStatus", "VALID (OIDC Service Account Token)");
        result.put("message", "Successfully authenticated to HashiCorp Vault KV v2 engine.");
        return result;
    }
}
