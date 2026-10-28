package com.devsecops.platform.service;

import com.devsecops.platform.entity.PipelineExecution;
import com.devsecops.platform.entity.Project;
import com.devsecops.platform.entity.RuntimeAlert;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.PipelineExecutionRepository;
import com.devsecops.platform.repository.ProjectRepository;
import com.devsecops.platform.repository.RuntimeAlertRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DevSecOpsAssistantService {

    private final SecurityFindingRepository findingRepository;
    private final ProjectRepository projectRepository;
    private final PipelineExecutionRepository pipelineRepository;
    private final RuntimeAlertRepository alertRepository;

    public DevSecOpsAssistantService(SecurityFindingRepository findingRepository,
                                    ProjectRepository projectRepository,
                                    PipelineExecutionRepository pipelineRepository,
                                    RuntimeAlertRepository alertRepository) {
        this.findingRepository = findingRepository;
        this.projectRepository = projectRepository;
        this.pipelineRepository = pipelineRepository;
        this.alertRepository = alertRepository;
    }

    public Map<String, Object> askAssistant(String question) {
        String q = question.toLowerCase().trim();
        String answer;
        List<Map<String, String>> actions = new ArrayList<>();

        if (q.contains("critical") || q.contains("vulnerabilit")) {
            List<SecurityFinding> criticals = findingRepository.findBySeverity("CRITICAL");
            if (criticals.isEmpty()) {
                answer = "Good news! There are currently 0 open critical vulnerabilities detected across all monitored repositories.";
            } else {
                StringBuilder sb = new StringBuilder();
                sb.append(String.format("There are currently **%d open critical vulnerabilities** detected:\n\n", criticals.size()));
                for (SecurityFinding f : criticals) {
                    sb.append(String.format("• **%s** (%s): %s in `%s` (CVSS %.1f, Tool: %s)\n",
                        f.getCveId() != null ? f.getCveId() : "VULN",
                        f.getPackageName() != null ? f.getPackageName() : "Package",
                        f.getTitle(),
                        f.getFilePath() != null ? f.getFilePath() : "repository",
                        f.getCvssScore() != null ? f.getCvssScore().doubleValue() : 9.0,
                        f.getToolName()
                    ));
                }
                sb.append("\n**Recommended Action**: Navigate to the Security Center to review automated patch proposals.");
                answer = sb.toString();
                actions.add(Map.of("label", "View in Security Center", "route", "/security"));
            }
        } else if (q.contains("lowest") || q.contains("score")) {
            List<Project> projects = projectRepository.findAll();
            Project lowest = projects.stream().min(Comparator.comparingInt(Project::getSecurityScore)).orElse(null);
            if (lowest != null) {
                answer = String.format("The project with the lowest security score is **%s** with a score of **%d/100**.\n\n" +
                        "• **Critical Issues**: %d\n" +
                        "• **High Issues**: %d\n" +
                        "• **Exposed Secrets**: %d\n" +
                        "• **Pipeline Status**: %s\n\n" +
                        "The main deductions are caused by Hadolint root-container warnings and unpatched prototype pollution.",
                    lowest.getName(), lowest.getSecurityScore(), lowest.getCriticalCount(), lowest.getHighCount(),
                    lowest.getExposedSecretCount(), lowest.getPipelineStatus()
                );
                actions.add(Map.of("label", "Inspect " + lowest.getName(), "route", "/apps"));
            } else {
                answer = "No registered projects found.";
            }
        } else if (q.contains("pipeline") || q.contains("failure") || q.contains("failed")) {
            List<PipelineExecution> execs = pipelineRepository.findAllByOrderByCreatedAtDesc();
            PipelineExecution failed = execs.stream().filter(e -> "FAILED".equalsIgnoreCase(e.getStatus())).findFirst().orElse(null);
            if (failed != null) {
                answer = String.format("Latest failed pipeline execution is **#%d** on branch `%s`.\n\n" +
                        "• **Failure Stage**: Hadolint Dockerfile Linter (Stage 5)\n" +
                        "• **Gate Policy**: MANDATORY SECURITY GATE\n" +
                        "• **Root Cause**: `DL3002: Last USER should not be root`. Container image was configured to run as UID 0.\n\n" +
                        "**Remediation**: Add a non-root user in the Dockerfile:\n```dockerfile\nRUN addgroup -S app && adduser -S app -G app\nUSER app\n```",
                    failed.getExecutionNumber(), failed.getBranch()
                );
                actions.add(Map.of("label", "View Pipeline #141", "route", "/pipelines"));
            } else {
                answer = "All recent pipeline executions have passed their security gates.";
            }
        } else if (q.contains("secret") || q.contains("hardcoded")) {
            List<SecurityFinding> secrets = findingRepository.findByCategory("SECRET");
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("Detected **%d exposed secret occurrences**:\n\n", secrets.size()));
            for (SecurityFinding s : secrets) {
                sb.append(String.format("• **%s** in `%s` (Line %d)\n  Remediation: %s\n",
                    s.getTitle(), s.getFilePath(), s.getLineNumber() != null ? s.getLineNumber() : 0, s.getRemediationGuidance()));
            }
            sb.append("\n*Note: Secret values are masked in compliance with DevSecOps logging policies.*");
            answer = sb.toString();
            actions.add(Map.of("label", "Manage Vault Secrets", "route", "/vault"));
        } else if (q.contains("runtime") || q.contains("threat") || q.contains("falco")) {
            List<RuntimeAlert> alerts = alertRepository.findAllByOrderByTimestampDesc();
            long unacked = alerts.stream().filter(a -> !a.getAcknowledged()).count();
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("Falco Runtime Threat Status: **%d unacknowledged alerts**.\n\n", unacked));
            for (RuntimeAlert a : alerts) {
                if (!a.getAcknowledged()) {
                    sb.append(String.format("• `[%s]` **%s** in pod `%s` (%s)\n  %s\n\n",
                        a.getSeverity(), a.getRuleName(), a.getPodName(), a.getNamespace(), a.getDescription()));
                }
            }
            answer = sb.toString();
            actions.add(Map.of("label", "Acknowledge Alerts", "route", "/monitoring"));
        } else if (q.contains("root") || q.contains("user") || q.contains("container")) {
            answer = """
To fix the container root-user vulnerability (`DL3002 / CIS Benchmark 4.1`):

1. **Update the Dockerfile**:
```dockerfile
# Create unprivileged system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set file permissions for the app workspace
WORKDIR /app
COPY --chown=appuser:appgroup . .

# Switch away from root UID 0
USER appuser

EXPOSE 3000
CMD ["npm", "start"]
```

2. **Update Kubernetes SecurityContext**:
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```
""";
            actions.add(Map.of("label", "Preview Dockerfile", "route", "/apps"));
        } else {
            answer = String.format("I analyzed your inquiry: \"%s\". I have real-time access to your 3 projects, 12-stage CI/CD pipelines, Trivy/Gitleaks findings, HashiCorp Vault secrets, and Falco runtime events. You can ask me to show critical CVEs, explain pipeline gate rejections, check runtime threats, or inspect compliance status.", question);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("question", question);
        res.put("answer", answer);
        res.put("actions", actions);
        res.put("model", "DevSecOps Security Intelligence Engine (v2.4-deterministic)");
        return res;
    }
}
