package com.devsecops.platform.service;

import com.devsecops.platform.entity.Project;
import org.springframework.stereotype.Service;

@Service
public class DockerfileGeneratorService {

    public String generateSecureDockerfile(Project project) {
        String lang = project.getLanguage() != null ? project.getLanguage().toLowerCase() : "node";

        if (lang.contains("rust")) {
            return """
# Multi-stage secure build for Rust
FROM rust:1.77-alpine as builder
WORKDIR /usr/src/app
RUN apk add --no-cache musl-dev
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.19
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /usr/src/app/target/release/pake /app/pake
USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/pake"]
""";
        }

        return """
# Multi-stage secure build for Node.js / React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security hardening: Create non-root system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 devsecops

COPY --from=builder --chown=devsecops:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=devsecops:nodejs /app/dist ./dist
COPY --from=builder --chown=devsecops:nodejs /app/package.json ./package.json

USER devsecops
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
""";
    }

    public String generateKubernetesDeployment(Project project) {
        String name = project.getSlug() != null ? project.getSlug() : "app";
        return String.format("""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: %s-deployment
  namespace: production
  labels:
    app: %s
    security.devsecops.io/policy: restricted
spec:
  replicas: 2
  selector:
    matchLabels:
      app: %s
  template:
    metadata:
      labels:
        app: %s
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: %s
        image: docker.enterprise.internal/%s:v1.0.0
        imagePullPolicy: IfNotPresent
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
      volumes:
      - name: tmp-volume
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: %s-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: %s
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
""", name, name, name, name, name, name, name, name);
    }
}
