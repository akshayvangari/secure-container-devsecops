package com.devsecops.platform.repository;

import com.devsecops.platform.entity.PipelineExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineExecutionRepository extends JpaRepository<PipelineExecution, String> {
    List<PipelineExecution> findByProjectIdOrderByCreatedAtDesc(String projectId);
    List<PipelineExecution> findAllByOrderByCreatedAtDesc();
}
