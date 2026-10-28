package com.devsecops.platform.controller;

import com.devsecops.platform.service.ProjectService;
import com.devsecops.platform.service.SecurityScanService;
import com.devsecops.platform.service.PipelineOrchestratorService;
import com.devsecops.platform.service.RuntimeMonitoringService;
import com.devsecops.platform.service.ComplianceAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProjectService projectService;
    private final SecurityScanService scanService;
    private final PipelineOrchestratorService pipelineService;
    private final RuntimeMonitoringService runtimeService;
    private final ComplianceAuditService complianceService;

    public DashboardController(ProjectService projectService,
                               SecurityScanService scanService,
                               PipelineOrchestratorService pipelineService,
                               RuntimeMonitoringService runtimeService,
                               ComplianceAuditService complianceService) {
        this.projectService = projectService;
        this.scanService = scanService;
        this.pipelineService = pipelineService;
        this.runtimeService = runtimeService;
        this.complianceService = complianceService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> scanSummary = scanService.getSecuritySummary();
        var projects = projectService.getAllProjects();
        var pipelines = pipelineService.getAllExecutions();
        var runtimeSummary = runtimeService.getMonitoringSummary();
        var complianceSummary = complianceService.getComplianceSummary();

        Map<String, Object> response = new HashMap<>();
        response.put("overallSecurityScore", scanSummary.get("averageSecurityScore"));
        response.put("totalProjects", projects.size());
        response.put("pipelineExecutions", pipelines.size());
        response.put("openVulnerabilities", scanSummary.get("totalFindings"));
        response.put("criticalFindings", scanSummary.get("criticalFindings"));
        response.put("highFindings", scanSummary.get("highFindings"));
        response.put("exposedSecrets", scanSummary.get("exposedSecrets"));
        response.put("activeThreats", runtimeSummary.get("activeThreats"));
        response.put("complianceScore", complianceSummary.get("overallComplianceScore"));
        response.put("clusterStatus", runtimeSummary.get("clusterStatus"));
        response.put("falcoEngineStatus", runtimeSummary.get("falcoEngineStatus"));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vulnerability-trends")
    public ResponseEntity<List<Map<String, Object>>> getVulnerabilityTrends() {
        List<Map<String, Object>> trends = List.of(
            Map.of("day", "Day 1", "critical", 4, "high", 12, "medium", 18, "score", 62),
            Map.of("day", "Day 5", "critical", 3, "high", 11, "medium", 17, "score", 66),
            Map.of("day", "Day 10", "critical", 3, "high", 10, "medium", 16, "score", 69),
            Map.of("day", "Day 15", "critical", 2, "high", 9, "medium", 15, "score", 73),
            Map.of("day", "Day 20", "critical", 2, "high", 8, "medium", 14, "score", 75),
            Map.of("day", "Day 25", "critical", 1, "high", 7, "medium", 13, "score", 78),
            Map.of("day", "Day 30", "critical", 1, "high", 6, "medium", 12, "score", 81)
        );
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<Map<String, Object>> getRecentActivity() {
        Map<String, Object> activity = new HashMap<>();
        activity.put("recentPipelines", pipelineService.getAllExecutions().stream().limit(5).toList());
        activity.put("recentFindings", scanService.getAllFindings().stream().limit(5).toList());
        activity.put("recentAlerts", runtimeService.getAllAlerts().stream().limit(5).toList());
        return ResponseEntity.ok(activity);
    }
}
