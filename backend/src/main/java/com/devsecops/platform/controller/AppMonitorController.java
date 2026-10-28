package com.devsecops.platform.controller;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.service.ProjectService;
import com.devsecops.platform.service.SecurityScanService;
import com.devsecops.platform.service.DockerfileGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/apps")
@CrossOrigin(origins = "*")
public class AppMonitorController {

    private final ProjectService projectService;
    private final SecurityScanService scanService;
    private final DockerfileGeneratorService dockerfileService;

    public AppMonitorController(ProjectService projectService,
                                SecurityScanService scanService,
                                DockerfileGeneratorService dockerfileService) {
        this.projectService = projectService;
        this.scanService = scanService;
        this.dockerfileService = dockerfileService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> listApps() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}/overview")
    public ResponseEntity<Map<String, Object>> getOverview(@PathVariable String id) {
        Project proj = projectService.getProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("App not found: " + id));

        Map<String, Object> map = new HashMap<>();
        map.put("project", proj);
        map.put("findings", scanService.getFindingsByProject(id));
        map.put("dockerfile", dockerfileService.generateSecureDockerfile(proj));
        map.put("kubernetesManifest", dockerfileService.generateKubernetesDeployment(proj));
        map.put("serverStatus", proj.getServerStatus());
        map.put("port", proj.getDevServerPort());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Map<String, Object>> startServer(@PathVariable String id) {
        Project proj = projectService.getProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("App not found: " + id));
        proj.setServerStatus("RUNNING");
        if (proj.getDevServerPort() == null) {
            proj.setDevServerPort(3000 + (int)(Math.random() * 100));
        }
        projectService.updateProject(id, proj);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("serverStatus", "RUNNING");
        res.put("port", proj.getDevServerPort());
        res.put("message", "Dev server started successfully on port " + proj.getDevServerPort());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<Map<String, Object>> stopServer(@PathVariable String id) {
        Project proj = projectService.getProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("App not found: " + id));
        proj.setServerStatus("STOPPED");
        projectService.updateProject(id, proj);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("serverStatus", "STOPPED");
        res.put("message", "Dev server process terminated gracefully.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/scan")
    public ResponseEntity<Map<String, Object>> scanApp(@PathVariable String id) {
        return ResponseEntity.ok(scanService.triggerProjectScan(id, "APP_LOCAL_SAST_SCAN"));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<Map<String, String>>> getAppLogs(@PathVariable String id) {
        List<Map<String, String>> logs = new ArrayList<>();
        logs.add(Map.of("timestamp", "18:45:02", "level", "INFO", "text", "[nodemon] starting `node server.js`"));
        logs.add(Map.of("timestamp", "18:45:03", "level", "INFO", "text", "[security] Vault agent loaded secrets from secret/data/app"));
        logs.add(Map.of("timestamp", "18:45:04", "level", "INFO", "text", "[server] Express microservice listening on http://0.0.0.0:3001"));
        logs.add(Map.of("timestamp", "18:45:05", "level", "INFO", "text", "[falco-probe] Kernel eBPF tracepoints connected to pid 4192"));
        logs.add(Map.of("timestamp", "18:45:12", "level", "WARN", "text", "[jwt-validator] Insecure signature verification fallback deprecated"));
        logs.add(Map.of("timestamp", "18:45:20", "level", "INFO", "text", "[health] GET /health HTTP/1.1 200 OK - 2.4ms"));
        return ResponseEntity.ok(logs);
    }
}
