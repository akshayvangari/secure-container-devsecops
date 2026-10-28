package com.devsecops.platform.controller;

import com.devsecops.platform.entity.ComplianceControl;
import com.devsecops.platform.service.ComplianceAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceAuditController {

    private final ComplianceAuditService complianceService;

    public ComplianceAuditController(ComplianceAuditService complianceService) {
        this.complianceService = complianceService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(complianceService.getComplianceSummary());
    }

    @GetMapping("/controls")
    public ResponseEntity<List<ComplianceControl>> getControls(@RequestParam(required = false) String frameworkId) {
        if (frameworkId != null && !frameworkId.isBlank()) {
            return ResponseEntity.ok(complianceService.getControlsByFramework(frameworkId));
        }
        return ResponseEntity.ok(complianceService.getAllControls());
    }

    @PostMapping("/audit")
    public ResponseEntity<Map<String, Object>> triggerAudit() {
        return ResponseEntity.ok(complianceService.triggerReAudit());
    }

    @GetMapping("/evidence")
    public ResponseEntity<List<Map<String, String>>> getEvidence() {
        List<Map<String, String>> evidence = List.of(
            Map.of("id", "evi-01", "control", "CC6.1", "source", "Gitleaks", "status", "VERIFIED", "timestamp", "2026-10-09T08:00:00Z"),
            Map.of("id", "evi-02", "control", "CC6.6", "source", "Trivy / Cosign", "status", "PASSED", "timestamp", "2026-10-09T08:15:00Z"),
            Map.of("id", "evi-03", "control", "CC6.8", "source", "Falco DaemonSet", "status", "FAIL", "timestamp", "2026-10-09T08:30:00Z"),
            Map.of("id", "evi-04", "control", "A.8.28", "source", "SonarQube", "status", "PASSED", "timestamp", "2026-10-09T08:45:00Z"),
            Map.of("id", "evi-05", "control", "A.8.9", "source", "Hadolint", "status", "FAIL", "timestamp", "2026-10-09T09:00:00Z")
        );
        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportPackage() {
        Map<String, Object> pkg = new HashMap<>();
        pkg.put("exportId", "audit-pkg-" + UUID.randomUUID().toString().substring(0, 8));
        pkg.put("frameworks", List.of("SOC 2 Type II", "ISO 27001:2022", "NIST SP 800-53", "PCI DSS v4.0", "HIPAA"));
        pkg.put("status", "COMPILED");
        pkg.put("evaluatedTimestamp", new Date().toString());
        pkg.put("disclaimer", "Automated technical evaluations provide operational control evidence and do not constitute legal compliance.");
        return ResponseEntity.ok(pkg);
    }
}
