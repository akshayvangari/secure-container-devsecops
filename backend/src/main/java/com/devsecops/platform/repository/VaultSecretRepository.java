package com.devsecops.platform.repository;

import com.devsecops.platform.entity.VaultSecretMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaultSecretRepository extends JpaRepository<VaultSecretMetadata, String> {
    List<VaultSecretMetadata> findByProjectId(String projectId);
}
