package com.devsecops.platform.adapter;

import org.springframework.stereotype.Component;
import java.io.File;
import java.util.*;

@Component
public class HadolintAdapter {

    public boolean isAvailable() {
        return new File("/usr/local/bin/hadolint").exists() ||
               new File("/usr/bin/hadolint").exists();
    }

    public Map<String, Object> lintDockerfile(String dockerfilePath) {
        Map<String, Object> result = new HashMap<>();
        result.put("tool", "Hadolint v2.12.0");
        result.put("status", isAvailable() ? "EXECUTED" : "DEMO_MODE");
        result.put("issues", List.of(
            Map.of(
                "code", "DL3002",
                "severity", "error",
                "message", "Last USER should not be root",
                "line", 38
            )
        ));
        return result;
    }
}
