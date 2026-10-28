package com.devsecops.platform.repository;

import com.devsecops.platform.entity.RemediationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemediationJobRepository extends JpaRepository<RemediationJob, String> {
    List<RemediationJob> findByProjectId(String projectId);
    List<RemediationJob> findByStatus(String status);
}
