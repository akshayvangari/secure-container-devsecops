# Multi-stage secure build for Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Minimal secure runtime image
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Harden security: Non-root user and group
RUN addgroup -S devsecops && adduser -S devsecops -G devsecops

COPY --from=builder --chown=devsecops:devsecops /build/target/*.jar app.jar

USER devsecops

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
