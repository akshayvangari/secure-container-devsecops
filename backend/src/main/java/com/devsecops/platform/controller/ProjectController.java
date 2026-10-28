package com.devsecops.platform.controller;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.service.ProjectService;
import com.devsecops.platform.service.SecurityScanService;
import com.devsecops.platform.service.PipelineOrchestratorService;
import com.devsecops.platform.service.DockerfileGeneratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;
    private final SecurityScanService scanService;
    private final PipelineOrchestratorService pipelineService;
    private final DockerfileGeneratorService dockerfileService;

    public ProjectController(ProjectService projectService,
                             SecurityScanService scanService,
                             PipelineOrchestratorService pipelineService,
                             DockerfileGeneratorService dockerfileService) {
        this.projectService = projectService;
        this.scanService = scanService;
        this.pipelineService = pipelineService;
        this.dockerfileService = dockerfileService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable String id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Project project) {
        Project created = projectService.createProject(project);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable String id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully", "id", id));
    }

    @PostMapping("/{id}/scan")
    public ResponseEntity<Map<String, Object>> scanProject(@PathVariable String id,
                                                           @RequestParam(required = false) String scanType) {
        return ResponseEntity.ok(scanService.triggerProjectScan(id, scanType));
    }

    @PostMapping("/{id}/pipeline")
    public ResponseEntity<?> triggerPipeline(@PathVariable String id,
                                             @RequestParam(required = false) String branch) {
        return ResponseEntity.ok(pipelineService.triggerPipeline(id, branch, "Project Dashboard"));
    }

    @GetMapping("/{id}/dockerfile-preview")
    public ResponseEntity<Map<String, String>> getDockerfilePreview(@PathVariable String id) {
        return projectService.getProjectById(id)
                .map(proj -> Map.of(
                    "dockerfile", dockerfileService.generateSecureDockerfile(proj),
                    "kubernetesYaml", dockerfileService.generateKubernetesDeployment(proj)
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
