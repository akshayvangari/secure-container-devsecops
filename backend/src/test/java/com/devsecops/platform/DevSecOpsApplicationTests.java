package com.devsecops.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DevSecOpsApplicationTests {

    @Test
    void contextLoads() {
        // Confirms Spring Boot application context bootstraps cleanly
    }
}
