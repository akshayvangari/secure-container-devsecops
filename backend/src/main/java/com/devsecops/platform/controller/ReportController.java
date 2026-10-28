package com.devsecops.platform.controller;

import com.devsecops.platform.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getReports() {
        return ResponseEntity.ok(reportService.getAvailableReports());
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(reportService.generateReport(request));
    }

    @GetMapping("/export-csv")
    public ResponseEntity<String> exportCsv() {
        String csv = reportService.exportFindingsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vulnerability_assessment.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Map<String, Object>> downloadReport(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
            "reportId", id,
            "status", "GENERATED",
            "message", "Report compiled successfully. Printable view available."
        ));
    }
}
