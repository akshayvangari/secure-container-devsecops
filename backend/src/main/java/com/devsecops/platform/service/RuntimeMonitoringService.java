package com.devsecops.platform.service;

import com.devsecops.platform.entity.KubernetesPod;
import com.devsecops.platform.entity.RuntimeAlert;
import com.devsecops.platform.repository.KubernetesPodRepository;
import com.devsecops.platform.repository.RuntimeAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class RuntimeMonitoringService {

    private final RuntimeAlertRepository alertRepository;
    private final KubernetesPodRepository podRepository;

    public RuntimeMonitoringService(RuntimeAlertRepository alertRepository,
                                    KubernetesPodRepository podRepository) {
        this.alertRepository = alertRepository;
        this.podRepository = podRepository;
    }

    public Map<String, Object> getMonitoringSummary() {
        List<KubernetesPod> pods = podRepository.findAll();
        List<RuntimeAlert> alerts = alertRepository.findAllByOrderByTimestampDesc();
        long unacknowledgedAlerts = alerts.stream().filter(a -> !a.getAcknowledged()).count();
        long criticalAlerts = alerts.stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity()) && !a.getAcknowledged()).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("activePods", pods.size());
        summary.put("cpuUsagePercent", 42);
        summary.put("memoryUsagePercent", 68);
        summary.put("networkThroughput", "1.2 GB/s");
        summary.put("activeThreats", unacknowledgedAlerts);
        summary.put("criticalThreats", criticalAlerts);
        summary.put("clusterStatus", "HEALTHY");
        summary.put("clusterName", "prod-k8s-cluster-01");
        summary.put("namespace", "production");
        summary.put("falcoEngineStatus", "ATTACHED (v0.37.1)");
        return summary;
    }

    public List<RuntimeAlert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    public List<KubernetesPod> getAllPods() {
        return podRepository.findAll();
    }

    public RuntimeAlert acknowledgeAlert(String id, String user) {
        RuntimeAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + id));
        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(user != null ? user : "security-engineer");
        alert.setAcknowledgedAt(Instant.now());
        return alertRepository.save(alert);
    }

    public RuntimeAlert ingestFalcoAlert(Map<String, Object> payload) {
        RuntimeAlert alert = new RuntimeAlert();
        alert.setId("flc-" + UUID.randomUUID().toString().substring(0, 8));
        alert.setRuleName((String) payload.getOrDefault("rule", "Unauthorized container operation"));
        alert.setSeverity((String) payload.getOrDefault("priority", "WARNING"));
        alert.setPodName((String) payload.getOrDefault("pod", "netflix-clone-backend"));
        alert.setContainerName((String) payload.getOrDefault("container", "main-app"));
        alert.setNamespace((String) payload.getOrDefault("namespace", "production"));
        alert.setDescription((String) payload.getOrDefault("output", "Falco security event triggered."));
        alert.setTimestamp(Instant.now());
        alert.setAcknowledged(false);
        return alertRepository.save(alert);
    }
}
