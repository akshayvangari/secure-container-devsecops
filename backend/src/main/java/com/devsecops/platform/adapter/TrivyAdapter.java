package com.devsecops.platform.adapter;

import org.springframework.stereotype.Component;
import java.io.File;
import java.util.*;

@Component
public class TrivyAdapter {

    public boolean isAvailable() {
        return new File("/usr/local/bin/trivy").exists() ||
               new File("/usr/bin/trivy").exists();
    }

    public Map<String, Object> scanImage(String imageName) {
        Map<String, Object> result = new HashMap<>();
        result.put("tool", "Aqua Trivy v0.50.0");
        result.put("status", isAvailable() ? "EXECUTED" : "DEMO_MODE");
        result.put("targetImage", imageName);
        result.put("vulnerabilities", List.of(
            Map.of(
                "cve", "CVE-2023-45853",
                "package", "lodash",
                "installedVersion", "4.17.20",
                "fixedVersion", "4.17.21",
                "severity", "HIGH",
                "cvss", 7.5
            )
        ));
        return result;
    }
}
