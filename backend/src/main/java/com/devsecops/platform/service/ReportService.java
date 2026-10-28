package com.devsecops.platform.service;

import com.devsecops.platform.entity.Project;
import com.devsecops.platform.entity.SecurityFinding;
import com.devsecops.platform.repository.ProjectRepository;
import com.devsecops.platform.repository.SecurityFindingRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class ReportService {

    private final ProjectRepository projectRepository;
    private final SecurityFindingRepository findingRepository;

    public ReportService(ProjectRepository projectRepository, SecurityFindingRepository findingRepository) {
        this.projectRepository = projectRepository;
        this.findingRepository = findingRepository;
    }

    public List<Map<String, Object>> getAvailableReports() {
        return List.of(
            Map.of("id", "rep-01", "title", "Executive Security Summary", "type", "EXECUTIVE", "format", "PDF", "createdAt", "2026-10-09T10:00:00Z"),
            Map.of("id", "rep-02", "title", "Project Security Assessment - Netflix Clone", "type", "PROJECT", "format", "PDF", "createdAt", "2026-10-09T08:30:00Z"),
            Map.of("id", "rep-03", "title", "Vulnerability Inventory & Exploitability Analysis", "type", "VULNERABILITY", "format", "CSV", "createdAt", "2026-10-09T07:15:00Z"),
            Map.of("id", "rep-04", "title", "SOC 2 Type II Continuous Compliance Evidence Package", "type", "COMPLIANCE", "format", "PDF", "createdAt", "2026-10-09T06:00:00Z"),
            Map.of("id", "rep-05", "title", "Falco Runtime Threat Detection Log", "type", "RUNTIME", "format", "CSV", "createdAt", "2026-10-08T22:00:00Z")
        );
    }

    public Map<String, Object> generateReport(Map<String, Object> request) {
        String title = (String) request.getOrDefault("title", "DevSecOps Executive Audit Report");
        String reportType = (String) request.getOrDefault("reportType", "EXECUTIVE");
        String format = (String) request.getOrDefault("format", "PDF");

        List<Project> projects = projectRepository.findAll();
        List<SecurityFinding> findings = findingRepository.findAll();

        Map<String, Object> response = new HashMap<>();
        response.put("reportId", "rep-" + UUID.randomUUID().toString().substring(0, 8));
        response.put("title", title);
        response.put("reportType", reportType);
        response.put("format", format);
        response.put("generatedAt", Instant.now().toString());
        response.put("status", "READY");
        response.put("totalProjectsEvaluated", projects.size());
        response.put("totalVulnerabilitiesIdentified", findings.size());
        response.put("downloadUrl", "/api/reports/" + response.get("reportId") + "/download");

        return response;
    }

    public String exportFindingsCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Project,Category,Title,CVE_ID,Package,Installed_Version,Fixed_Version,Severity,CVSS,Tool,Status\n");
        List<SecurityFinding> findings = findingRepository.findAll();
        for (SecurityFinding f : findings) {
            sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,\"%s\",\"%s\"\n",
                f.getId(), f.getProjectId(), f.getCategory(),
                f.getTitle().replace("\"", "\"\""),
                f.getCveId() != null ? f.getCveId() : "N/A",
                f.getPackageName() != null ? f.getPackageName() : "N/A",
                f.getInstalledVersion() != null ? f.getInstalledVersion() : "N/A",
                f.getFixedVersion() != null ? f.getFixedVersion() : "N/A",
                f.getSeverity(),
                f.getCvssScore() != null ? f.getCvssScore().toString() : "0.0",
                f.getToolName(),
                f.getRemediationStatus()
            ));
        }
        return sb.toString();
    }
}
