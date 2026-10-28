package com.devsecops.platform.controller;

import com.devsecops.platform.entity.PipelineExecution;
import com.devsecops.platform.service.PipelineOrchestratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/pipelines")
@CrossOrigin(origins = "*")
public class PipelineController {

    private final PipelineOrchestratorService pipelineService;

    public PipelineController(PipelineOrchestratorService pipelineService) {
        this.pipelineService = pipelineService;
    }

    @GetMapping
    public ResponseEntity<List<PipelineExecution>> getAll() {
        return ResponseEntity.ok(pipelineService.getAllExecutions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PipelineExecution> getById(@PathVariable String id) {
        return pipelineService.getExecutionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/trigger")
    public ResponseEntity<PipelineExecution> trigger(@RequestParam String projectId,
                                                     @RequestParam(required = false) String branch) {
        return ResponseEntity.ok(pipelineService.triggerPipeline(projectId, branch, "User Manual Trigger"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PipelineExecution> cancel(@PathVariable String id) {
        return ResponseEntity.ok(pipelineService.cancelExecution(id));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<Map<String, String>>> getLogs(@PathVariable String id) {
        return ResponseEntity.ok(pipelineService.getExecutionLogs(id));
    }

    @GetMapping("/jenkinsfile-template")
    public ResponseEntity<Map<String, String>> getJenkinsfileTemplate() {
        String template = """
pipeline {
    agent {
        docker {
            image 'docker.enterprise.internal/devsecops-agent:v2.0'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    environment {
        VAULT_ADDR = credentials('enterprise-vault-addr')
        VAULT_TOKEN = credentials('enterprise-vault-token')
        COSIGN_KEY = credentials('enterprise-cosign-private')
        TRIVY_SEVERITY = 'CRITICAL,HIGH'
    }
    stages {
        stage('Git Clone & Vault Sync') {
            steps {
                echo 'Checking out source and syncing dynamic secrets from Vault KV v2...'
            }
        }
        stage('Secret Detection — Gitleaks') {
            steps {
                sh 'gitleaks detect --source . --verbose --redact'
            }
        }
        stage('Static Code Analysis — SonarQube') {
            steps {
                sh 'mvn clean verify sonar:sonar'
            }
        }
        stage('Dependency Scan — OWASP DC') {
            steps {
                sh 'dependency-check.sh --project my-app --scan . --failOnCVSS 7'
            }
        }
        stage('Dockerfile Linting — Hadolint') {
            steps {
                sh 'hadolint Dockerfile --failure-threshold warning'
            }
        }
        stage('IaC Security — Checkov') {
            steps {
                sh 'checkov -d k8s/ --framework kubernetes --soft-fail'
            }
        }
        stage('Container Build') {
            steps {
                sh 'docker build -t app:latest .'
            }
        }
        stage('Container Scan — Trivy') {
            steps {
                sh 'trivy image --exit-code 1 --severity CRITICAL app:latest'
            }
        }
        stage('Image Signing — Cosign') {
            steps {
                sh 'cosign sign --key $COSIGN_KEY app:latest'
            }
        }
        stage('Manifest Validation') {
            steps {
                sh 'kubeconform -summary -strict k8s/*.yaml'
            }
        }
        stage('Deployment') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
        stage('Post-Deployment Verification') {
            steps {
                sh 'kubectl rollout status deployment/app-deployment -n production --timeout=60s'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'target/**,trivy-results.json', allowEmptyArchive: true
        }
        failure {
            echo 'Security Gate violation: Deployment blocked.'
        }
    }
}
""";
        return ResponseEntity.ok(Map.of("jenkinsfile", template));
    }
}
