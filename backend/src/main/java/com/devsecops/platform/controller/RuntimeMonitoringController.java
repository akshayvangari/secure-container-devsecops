package com.devsecops.platform.controller;

import com.devsecops.platform.entity.KubernetesPod;
import com.devsecops.platform.entity.RuntimeAlert;
import com.devsecops.platform.service.RuntimeMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/runtime")
@CrossOrigin(origins = "*")
public class RuntimeMonitoringController {

    private final RuntimeMonitoringService runtimeService;

    public RuntimeMonitoringController(RuntimeMonitoringService runtimeService) {
        this.runtimeService = runtimeService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(runtimeService.getMonitoringSummary());
    }

    @GetMapping("/pods")
    public ResponseEntity<List<KubernetesPod>> getPods() {
        return ResponseEntity.ok(runtimeService.getAllPods());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<RuntimeAlert>> getAlerts() {
        return ResponseEntity.ok(runtimeService.getAllAlerts());
    }

    @PostMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<RuntimeAlert> acknowledgeAlert(@PathVariable String id,
                                                         @RequestParam(required = false) String user) {
        return ResponseEntity.ok(runtimeService.acknowledgeAlert(id, user));
    }

    @PostMapping("/falco-webhook")
    public ResponseEntity<RuntimeAlert> falcoWebhook(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(runtimeService.ingestFalcoAlert(payload));
    }
}
