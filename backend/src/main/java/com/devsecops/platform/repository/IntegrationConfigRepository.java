package com.devsecops.platform.repository;

import com.devsecops.platform.entity.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, String> {
    Optional<IntegrationConfig> findByName(String name);
}
