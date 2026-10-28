package com.devsecops.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DevSecOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevSecOpsApplication.class, args);
    }
}
