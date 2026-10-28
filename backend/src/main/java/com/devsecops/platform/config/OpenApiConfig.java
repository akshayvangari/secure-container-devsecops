package com.devsecops.platform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI devSecOpsOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Secure Containerization in DevOps Environment API")
                .description("Production-grade DevSecOps Security, Container Vulnerability, CI/CD Pipeline Orchestration, HashiCorp Vault Secrets, and Falco Runtime Monitoring API.")
                .version("v1.0.0")
                .contact(new Contact()
                    .name("Cloud DevSecOps Engineering Team")
                    .email("secops@enterprise.internal"))
                .license(new License().name("Apache 2.0").url("https://spring.io")));
    }
}
