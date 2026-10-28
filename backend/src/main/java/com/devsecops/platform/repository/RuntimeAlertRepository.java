package com.devsecops.platform.repository;

import com.devsecops.platform.entity.RuntimeAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuntimeAlertRepository extends JpaRepository<RuntimeAlert, String> {
    List<RuntimeAlert> findAllByOrderByTimestampDesc();
    List<RuntimeAlert> findByAcknowledgedFalseOrderByTimestampDesc();
    List<RuntimeAlert> findBySeverity(String severity);
    long countByAcknowledgedFalse();
}
