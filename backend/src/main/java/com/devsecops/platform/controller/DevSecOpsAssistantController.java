package com.devsecops.platform.controller;

import com.devsecops.platform.service.DevSecOpsAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*")
public class DevSecOpsAssistantController {

    private final DevSecOpsAssistantService assistantService;

    public DevSecOpsAssistantController(DevSecOpsAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        return ResponseEntity.ok(assistantService.askAssistant(message));
    }
}
