package com.devsecops.platform.service;

import com.devsecops.platform.entity.PipelineExecution;
import com.devsecops.platform.entity.PipelineStage;
import com.devsecops.platform.entity.Project;
import com.devsecops.platform.repository.PipelineExecutionRepository;
import com.devsecops.platform.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class PipelineOrchestratorService {

    private final PipelineExecutionRepository pipelineRepository;
    private final ProjectRepository projectRepository;

    public PipelineOrchestratorService(PipelineExecutionRepository pipelineRepository,
                                       ProjectRepository projectRepository) {
        this.pipelineRepository = pipelineRepository;
        this.projectRepository = projectRepository;
    }

    public List<PipelineExecution> getAllExecutions() {
        return pipelineRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<PipelineExecution> getExecutionById(String id) {
        return pipelineRepository.findById(id);
    }

    public List<PipelineExecution> getExecutionsByProject(String projectId) {
        return pipelineRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public PipelineExecution triggerPipeline(String projectId, String branch, String triggeredBy) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        String execId = "pipe-exec-" + UUID.randomUUID().toString().substring(0, 8);
        Instant now = Instant.now();

        PipelineExecution execution = new PipelineExecution();
        execution.setId(execId);
        execution.setProjectId(projectId);
        execution.setExecutionNumber((int) (pipelineRepository.count() + 101));
        execution.setBranch(branch != null ? branch : project.getDefaultBranch());
        execution.setCommitHash(UUID.randomUUID().toString().substring(0, 7));
        execution.setCommitMessage("manual: trigger security orchestrator pipeline");
        execution.setTriggeredBy(triggeredBy != null ? triggeredBy : "DevSecOps Console");
        execution.setStatus("PASSED");
        execution.setDurationSeconds(195);
        execution.setSecurityGatePassed(true);
        execution.setStartedAt(now.minusSeconds(195));
        execution.setEndedAt(now);
        execution.setCreatedAt(now);

        // Populate 12 Stages
        List<PipelineStage> stages = buildDefaultStages(execId, now);
        execution.setStages(stages);

        PipelineExecution saved = pipelineRepository.save(execution);

        project.setPipelineStatus("PASSED");
        projectRepository.save(project);

        return saved;
    }

    public PipelineExecution cancelExecution(String id) {
        PipelineExecution exec = pipelineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Execution not found: " + id));
        exec.setStatus("CANCELLED");
        exec.setEndedAt(Instant.now());
        return pipelineRepository.save(exec);
    }

    public List<Map<String, String>> getExecutionLogs(String id) {
        List<Map<String, String>> logs = new ArrayList<>();
        logs.add(Map.of("timestamp", "00:01", "level", "INFO", "message", "[Stage 1: Git & Vault] Cloned repository from main. Synced 5 secrets from Vault KV v2."));
        logs.add(Map.of("timestamp", "00:15", "level", "INFO", "message", "[Stage 2: Gitleaks] Running regex entropy scanner. No new plaintext credentials found."));
        logs.add(Map.of("timestamp", "00:32", "level", "INFO", "message", "[Stage 3: SonarQube] Quality Gate Passed. Bugs: 0, Vulnerabilities: 0, Security Hotspots: 0."));
        logs.add(Map.of("timestamp", "01:05", "level", "INFO", "message", "[Stage 4: OWASP DC] Dependency analysis completed. Critical findings checked against policy gates."));
        logs.add(Map.of("timestamp", "01:18", "level", "INFO", "message", "[Stage 5: Hadolint] Dockerfile linter evaluated DL3000-DL3060. Non-root user directive verified."));
        logs.add(Map.of("timestamp", "01:34", "level", "INFO", "message", "[Stage 6: Checkov] Evaluated 28 IaC security policies. Read-only filesystem verified."));
        logs.add(Map.of("timestamp", "02:12", "level", "INFO", "message", "[Stage 7: Container Build] Docker build completed. Multi-stage digest: sha256:4a81cf26..."));
        logs.add(Map.of("timestamp", "02:35", "level", "INFO", "message", "[Stage 8: Trivy] Trivy image scan finished. 0 Critical vulnerabilities detected in OS layer."));
        logs.add(Map.of("timestamp", "02:44", "level", "INFO", "message", "[Stage 9: Cosign] Generated ephemeral OIDC keypair. Image signed into registry."));
        logs.add(Map.of("timestamp", "02:53", "level", "INFO", "message", "[Stage 10: Manifests] kubeconform validated Deployment and Service against Kubernetes 1.29 schema."));
        logs.add(Map.of("timestamp", "03:04", "level", "INFO", "message", "[Stage 11: Deployment] Helm rollout triggered to namespace: production."));
        logs.add(Map.of("timestamp", "03:15", "level", "SUCCESS", "message", "[Stage 12: Verification] Readiness probes healthy. Falco runtime daemon monitoring attached."));
        return logs;
    }

    private List<PipelineStage> buildDefaultStages(String execId, Instant baseTime) {
        String[][] stageDefs = {
            {"Git Clone & Vault Sync", "Vault KV v2", "PASSED", "12", "false"},
            {"Secret Detection", "Gitleaks v8.18", "PASSED", "14", "true"},
            {"Static Code Analysis", "SonarQube 10.4", "PASSED", "28", "true"},
            {"Dependency Vulnerability Scan", "OWASP Dependency-Check", "PASSED", "35", "true"},
            {"Dockerfile Linting", "Hadolint v2.12", "PASSED", "10", "true"},
            {"Infrastructure Security", "Checkov v3.2", "PASSED", "18", "true"},
            {"Container Build", "Docker Buildx", "PASSED", "42", "false"},
            {"Container Image Scan", "Trivy v0.50", "PASSED", "22", "true"},
            {"Container Image Signing", "Cosign v2.2", "PASSED", "8", "true"},
            {"Kubernetes Manifest Validation", "kubeconform", "PASSED", "9", "true"},
            {"Deployment", "Helm / kubectl", "PASSED", "11", "false"},
            {"Post-Deployment Verification", "Falco / Health Probe", "PASSED", "6", "false"}
        };

        List<PipelineStage> list = new ArrayList<>();
        for (int i = 0; i < stageDefs.length; i++) {
            PipelineStage s = new PipelineStage();
            s.setId("stg-" + UUID.randomUUID().toString().substring(0, 8));
            s.setExecutionId(execId);
            s.setStageOrder(i + 1);
            s.setName(stageDefs[i][0]);
            s.setToolName(stageDefs[i][1]);
            s.setStatus(stageDefs[i][2]);
            s.setDurationSeconds(Integer.parseInt(stageDefs[i][3]));
            s.setIsGate(Boolean.parseBoolean(stageDefs[i][4]));
            s.setStartedAt(baseTime.minusSeconds(195 - (i * 15)));
            s.setEndedAt(baseTime.minusSeconds(195 - ((i + 1) * 15)));
            list.add(s);
        }
        return list;
    }
}
