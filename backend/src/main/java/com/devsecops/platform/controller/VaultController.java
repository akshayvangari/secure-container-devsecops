package com.devsecops.platform.controller;

import com.devsecops.platform.entity.VaultSecretMetadata;
import com.devsecops.platform.service.VaultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/vault")
@CrossOrigin(origins = "*")
public class VaultController {

    private final VaultService vaultService;

    public VaultController(VaultService vaultService) {
        this.vaultService = vaultService;
    }

    @GetMapping("/secrets")
    public ResponseEntity<List<VaultSecretMetadata>> getAll(@RequestParam(required = false) String projectId) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(vaultService.getSecretsByProject(projectId));
        }
        return ResponseEntity.ok(vaultService.getAllSecrets());
    }

    @PostMapping("/secrets")
    public ResponseEntity<VaultSecretMetadata> createSecret(@RequestBody VaultSecretMetadata secret) {
        return ResponseEntity.ok(vaultService.createSecret(secret));
    }

    @PostMapping("/secrets/{id}/rotate")
    public ResponseEntity<VaultSecretMetadata> rotateSecret(@PathVariable String id) {
        return ResponseEntity.ok(vaultService.rotateSecret(id));
    }

    @DeleteMapping("/secrets/{id}")
    public ResponseEntity<Map<String, String>> deleteSecret(@PathVariable String id) {
        vaultService.deleteSecret(id);
        return ResponseEntity.ok(Map.of("message", "Secret deleted from Vault KV v2 engine", "id", id));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(vaultService.getVaultStatus());
    }

    @PostMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        return ResponseEntity.ok(vaultService.testConnection());
    }
}
