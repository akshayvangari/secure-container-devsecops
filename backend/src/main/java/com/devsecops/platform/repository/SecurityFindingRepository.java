package com.devsecops.platform.repository;

import com.devsecops.platform.entity.SecurityFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityFindingRepository extends JpaRepository<SecurityFinding, String> {
    List<SecurityFinding> findByProjectId(String projectId);
    List<SecurityFinding> findByCategory(String category);
    List<SecurityFinding> findBySeverity(String severity);
    List<SecurityFinding> findByRemediationStatus(String remediationStatus);
    long countBySeverity(String severity);
    long countByCategory(String category);
}
