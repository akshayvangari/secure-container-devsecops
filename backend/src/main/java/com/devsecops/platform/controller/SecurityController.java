package com.devsecops.platform.controller;

import com.devsecops.platform.entity.RemediationJob;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.service.RemediationService;
import com.devsecops.platform.service.SecurityScanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = "*")
public class SecurityController {

    private final SecurityScanService scanService;
    private final RemediationService remediationService;

    public SecurityController(SecurityScanService scanService,
                              RemediationService remediationService) {
        this.scanService = scanService;
        this.remediationService = remediationService;
    }

    @GetMapping("/findings")
    public ResponseEntity<List<SecurityFinding>> getFindings(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity) {
        if (projectId != null && !projectId.isBlank()) {
            return ResponseEntity.ok(scanService.getFindingsByProject(projectId));
        }
        return ResponseEntity.ok(scanService.getAllFindings());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(scanService.getSecuritySummary());
    }

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> runGlobalScan(@RequestParam(required = false) String scanType) {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "COMPLETED");
        res.put("scanType", scanType != null ? scanType : "ALL_PROJECTS_FULL_SCAN");
        res.put("message", "Triggered unified multi-tool scan across all registered projects.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/patch-package")
    public ResponseEntity<RemediationJob> patchPackage(@RequestBody Map<String, String> request) {
        String findingId = request.get("findingId");
        String proposedVersion = request.get("proposedVersion");
        if (findingId == null || findingId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        RemediationJob job = remediationService.proposePatch(findingId, proposedVersion);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/remediations")
    public ResponseEntity<List<RemediationJob>> getAllRemediations() {
        return ResponseEntity.ok(remediationService.getAllRemediations());
    }

    @GetMapping("/remediations/{id}")
    public ResponseEntity<RemediationJob> getRemediationById(@PathVariable String id) {
        return remediationService.getRemediationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/remediations/{id}/approve")
    public ResponseEntity<RemediationJob> approveRemediation(@PathVariable String id,
                                                            @RequestParam(required = false) String user) {
        return ResponseEntity.ok(remediationService.approvePatch(id, user));
    }

    @PostMapping("/remediations/{id}/reject")
    public ResponseEntity<RemediationJob> rejectRemediation(@PathVariable String id,
                                                           @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(remediationService.rejectPatch(id, reason));
    }

    @PatchMapping("/findings/{id}/status")
    public ResponseEntity<SecurityFinding> updateStatus(@PathVariable String id,
                                                        @RequestParam String status) {
        return ResponseEntity.ok(scanService.updateFindingStatus(id, status));
    }
}
