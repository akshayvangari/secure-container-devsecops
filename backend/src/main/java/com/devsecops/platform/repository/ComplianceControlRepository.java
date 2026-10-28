package com.devsecops.platform.repository;

import com.devsecops.platform.entity.ComplianceControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplianceControlRepository extends JpaRepository<ComplianceControl, String> {
    List<ComplianceControl> findByFrameworkId(String frameworkId);
    List<ComplianceControl> findByStatus(String status);
}
