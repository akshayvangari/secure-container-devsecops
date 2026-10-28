# Secure Containerization in DevOps Environment
## Full-Stack DevSecOps Security & Monitoring Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Hardened-326CE5.svg)](https://kubernetes.io/)
[![HashiCorp Vault](https://img.shields.io/badge/Vault-KV%20v2-black.svg)](https://www.vaultproject.io/)
[![Falco](https://img.shields.io/badge/Falco-eBPF%200.37-blueviolet.svg)](https://falco.org/)

---

## 1. Executive Summary

**"Secure Containerization in DevOps Environment"** is a production-grade enterprise security and continuous monitoring platform designed to unify the complete DevSecOps lifecycle into a single operational pane of glass.

The application integrates automated static code analysis, software composition analysis (SCA), exposed secret detection, Dockerfile hygiene, Infrastructure-as-Code (IaC) linting, cryptographic image signing, dynamic secret injection, Kubernetes runtime threat detection via eBPF, automated dependency remediation, and continuous compliance posture auditing across major regulatory standards.

---

## 2. Visual Design System

The user interface reproduces an enterprise DevSecOps operations console:
- **Left Navigation Sidebar**: Fixed 240px dark navy (`#0f172a`) sidebar with shield branding and blue active route indicators (`#2563eb`).
- **Top Header**: Clean white bar displaying real-time cluster guard health, quick actions, and route titles.
- **Main Workspace**: Light gray background (`#f8fafc`) housing responsive white cards (`#ffffff`) with subtle borders (`#e2e8f0`) and soft shadows.
- **Severity Badges**:
  - `CRITICAL`: Crimson `#fee2e2` / text `#b91c1c`
  - `HIGH`: Amber `#ffedd5` / text `#c2410c`
  - `MEDIUM`: Yellow `#fef3c7` / text `#b45309`
  - `LOW`: Cyan `#e0f2fe` / text `#0369a1`
  - `PASSED`: Emerald `#dcfce7` / text `#15803d`
- **Dark Terminal Live Logs**: High-contrast `#090d16` terminal with colored status indicators (green pass, red fail, yellow warn, cyan metadata), pause/resume, clear, and download controls.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS & custom design tokens
- **Icons**: Lucide React SVG icon set
- **Visualizations**: Interactive SVG vulnerability trend charts and security score gauges
- **Networking**: Axios and Fetch API client

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.x (Spring Web, Spring Security, Spring Data JPA, Spring Actuator, Spring Validation)
- **Security**: BCrypt password hashing, stateless token authentication, strict CORS
- **Documentation**: OpenAPI 3.0 / Swagger UI (`/swagger-ui/index.html`)

### Database & Migrations
- **Engine**: PostgreSQL 16+
- **Database Migrations**: Flyway (`V1__init_schema.sql`, `V2__seed_demo_data.sql`)
- **Tables**: 25 normalized relational tables covering users, projects, scans, findings, secrets, remediations, pipeline executions, stages, logs, Vault metadata, Falco runtime alerts, Kubernetes pods, compliance controls, evidence logs, settings, and audit trails.

### Infrastructure & Tool Integrations
- **CI/CD**: Jenkins declarative 12-stage pipeline (`Jenkinsfile`)
- **Containerization**: Docker multi-stage builds, non-root users (`devsecops` UID 1001), Docker Compose
- **Container Orchestration**: Kubernetes Deployment, Service, ConfigMap, Ingress, NetworkPolicy
- **Secret Management**: HashiCorp Vault KV v2 secrets engine
- **Security Scanners**:
  - **Gitleaks v8.18**: Exposed credential and private key detection
  - **SonarQube 10.4**: Static Application Security Testing (SAST) & Quality Gates
  - **OWASP Dependency-Check v9.0**: Software Composition Analysis (SCA)
  - **Hadolint v2.12**: Dockerfile best practice and root user linting
  - **Bridgecrew Checkov v3.2**: Infrastructure-as-Code (IaC) security
  - **Aqua Trivy v0.50**: Container image OS and package vulnerability scanner
  - **Sigstore Cosign v2.2**: Container image signing and OIDC verification
  - **Sysdig Falco v0.37**: Linux eBPF kernel runtime threat detection

---

## 4. Platform Navigation & 10 Functional Sections

```
├── 1. Dashboard               (/)
├── 2. Projects                (/projects)
├── 3. Pipelines               (/pipelines)
├── 4. Security Center         (/security)
├── 5. App Monitor             (/apps)
├── 6. Runtime Monitoring      (/monitoring)
├── 7. Vault                   (/vault)
├── 8. Compliance & Audit      (/compliance)
├── 9. Reports                 (/reports)
└── 10. Settings               (/settings)
```

### 1. Executive Dashboard (`/`)
- Top metric cards: Overall Security Score (out of 100), Total Projects, Pipeline Runs, Open Vulnerabilities, Active Falco Threats, Compliance Score.
- **30-Day Vulnerability Trends**: Dynamic chart tracking critical, high, and medium resolution.
- **Security Score by Application**: Netflix Clone (78%), Netflix Web (64%), Pake App (92%).
- **DevSecOps AI Assistant**: Real-time contextual chat answering security queries:
  - *"Show critical vulnerabilities."*
  - *"Which project has the lowest security score?"*
  - *"Explain my latest pipeline failure."*
  - *"How can I fix the root-container issue?"*
  - *"Show exposed secrets."*

### 2. Project Management (`/projects`)
- Project registry with stack detection, branch management, vulnerability counts, and status indicators.
- **Add Project Modal**: Form accepting name, git URL, default branch, and description with instant validation.
- **Trigger Security Scan**: Re-evaluates repository against all scanners and updates score in real time.
- **Dockerfile & Manifest Preview**: Generates hardened multi-stage Dockerfiles and restricted K8s specs.

### 3. Pipeline Orchestration (`/pipelines`)
Interactive 12-stage CI/CD orchestrator with live terminal output:
1. `Git Clone & Vault Sync`
2. `Secret Detection — Gitleaks`
3. `Static Code Analysis — SonarQube`
4. `Dependency Vulnerability Scan — OWASP Dependency-Check`
5. `Dockerfile Linting — Hadolint`
6. `Infrastructure Security — Checkov`
7. `Container Build`
8. `Container Image Scan — Trivy`
9. `Container Image Signing — Cosign`
10. `Kubernetes Manifest Validation`
11. `Deployment`
12. `Post-Deployment Verification`

**Mandatory Security Gates**:
- When Hadolint detects `DL3002 (Last USER should not be root)`, execution is automatically blocked before deployment.
- Downloadable execution logs and Jenkinsfile template viewer.

### 4. Security Center (`/security`)
- Top application overview cards for Netflix Clone, Netflix Web, and Pake.
- 4 Categorized Finding Tabs:
  - **CVE Vulnerabilities**: CVE id, package, installed version, fixed version, CVSS score, severity, exploitability.
  - **Hardcoded Secrets**: Masked secret values, file path, line number, entropy score, remediation guidance.
  - **Pipeline Security Errors**: Gate failures, stage name, error message, root cause.
  - **SAST & Docker Security**: Root container execution, unsanitized DOM injection, privileged capabilities.
- **Automated Vulnerability Remediation**:
  - `POST /api/security/patch-package`
  - Git-style unified diff preview
  - SemVer compatibility validation
  - One-click *Approve Patch & Create PR* action that merges the fix, marks the finding RESOLVED, and recalculates security scores!

### 5. App Monitor (`/apps`)
- Left-hand application switcher (Netflix Clone, Netflix Web, Pake).
- Development server controls: **Start Dev Server** / **Stop Dev Server**.
- Real-time process logging terminal with auto-scroll and timestamped output.
- Hardened Kubernetes manifest and Dockerfile tabs.

### 6. Runtime Monitoring (`/monitoring`)
- Cluster metrics: Active Pods (6), CPU (42%), Memory (68%), Network (1.2 GB/s), Active Threats.
- **Falco Alerts Table**: Rule name, severity, pod name, namespace, description, and **Acknowledge** action.
- **Kubernetes Pods Table**: Status, image, restarts, ready replicas, CPU, memory, and CIS benchmark compliance.

### 7. HashiCorp Vault Integration (`/vault`)
- Secret table: Key name, project scope, Vault path (`secret/data/...`), storage backend, version, status, and masked preview (`••••••••••••• [v3]`).
- **Add Secret**: Encrypts and registers metadata in Vault KV v2.
- **Rotate Secret**: Automatically increments secret version and updates rotation timestamp.
- **Test Connection**: Handshake verification testing latency and service account token status.

### 8. Compliance & Audit Center (`/compliance`)
Automated mapping of scan results and container configurations to 5 regulatory standards:
1. **SOC 2 Type II** (84% Compliant)
2. **ISO/IEC 27001:2022** (88% Compliant)
3. **NIST SP 800-53 Rev. 5** (79% Compliant)
4. **PCI DSS v4.0** (91% Compliant)
5. **HIPAA Security Rule** (86% Compliant)
- Control Gates Audit Log with automated technical evidence logs.
- Trigger Re-Audit and Export Audit Package actions.

### 9. Reports Center (`/reports`)
- Executive Security Summary (PDF printable layout)
- Project Security Assessment
- Vulnerability Inventory CSV export (`/api/reports/export-csv`)
- SOC 2 Type II Continuous Evidence Package

### 10. Settings & Integrations (`/settings`)
- **General**: Platform name, default branch, automatic K8s generation toggle.
- **Security Policies**: Configurable gates (block on critical, block on secrets, require signing, require non-root).
- **Notifications**: Slack webhooks, email recipients.
- **Integrations**: Live connection statuses and Test Connection buttons for all 12 tools (GitHub, Jenkins, Vault, Trivy, SonarQube, Gitleaks, Hadolint, Checkov, Cosign, Falco, Kubernetes).

---

## 5. Documented Security Scoring Algorithm

The platform computes project security scores using an objective, deterministic formula:

$$\text{Score} = 100 - (15 \times N_{\text{crit}}) - (8 \times N_{\text{high}}) - (3 \times N_{\text{med}}) - (1 \times N_{\text{low}}) - (20 \times N_{\text{secret}})$$

- Findings with status `RESOLVED` or `SUPPRESSED` are excluded.
- The score is clamped between 0 and 100.
- Resolving an issue or approving an automated patch immediately recalculates and updates the project's score.

---

## 6. Getting Started & Local Execution

### Prerequisites
- Java 21 JDK (installed at standard path or JDK home)
- Node.js 18+ (or bundled VS Code Node runtime)
- Docker & Docker Compose (optional for containerized setup)

### Quick Start (Native Local Server)

1. **Start the Platform Server**:
   ```bash
   ./scripts/start.sh
   ```
2. **Open the Dashboard**:
   Navigate to [http://localhost:8080](http://localhost:8080) in your browser.

3. **Run the Automated Test Suite**:
   ```bash
   ./scripts/test.sh
   ```

### Docker Compose Deployment

To run the complete ecosystem (PostgreSQL, HashiCorp Vault, Backend, Frontend):

```bash
docker-compose up --build -d
```

- Web Dashboard: `http://localhost:3000`
- Spring Boot REST API: `http://localhost:8080/api`
- HashiCorp Vault UI: `http://localhost:8200`
- PostgreSQL: `localhost:5432`

### Kubernetes Deployment

Apply the production-hardened manifests:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/ingress.yaml
```

Verify pod health:
```bash
kubectl get pods -n production -l app=devsecops-platform
```

---

## 7. REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard/summary` | GET | Dashboard overview metrics & security score |
| `/api/dashboard/vulnerability-trends` | GET | 30-day historical trend data |
| `/api/projects` | GET, POST | Project registry CRUD operations |
| `/api/projects/{id}/scan` | POST | Trigger multi-tool security scan |
| `/api/projects/{id}/dockerfile-preview` | GET | Generate hardened Dockerfile & K8s YAML |
| `/api/pipelines` | GET | Pipeline execution history |
| `/api/pipelines/trigger` | POST | Trigger 12-stage pipeline execution |
| `/api/pipelines/{id}/logs` | GET | Retrieve execution stdout/stderr logs |
| `/api/pipelines/{id}/cancel` | POST | Cancel active pipeline execution |
| `/api/security/findings` | GET | Retrieve findings filtered by project/severity |
| `/api/security/patch-package` | POST | Generate SemVer dependency patch & diff |
| `/api/security/remediations/{id}/approve` | POST | Approve patch, merge branch, resolve finding |
| `/api/apps/{id}/start` | POST | Launch local app dev server |
| `/api/apps/{id}/stop` | POST | Terminate local app dev server |
| `/api/vault/secrets` | GET, POST | Manage HashiCorp Vault KV v2 secrets |
| `/api/vault/secrets/{id}/rotate` | POST | Rotate secret and bump version |
| `/api/vault/test-connection` | POST | Test Vault API handshake |
| `/api/runtime/summary` | GET | Active pods, CPU, memory, and threat metrics |
| `/api/runtime/alerts` | GET | Retrieve Falco eBPF runtime events |
| `/api/runtime/alerts/{id}/acknowledge` | POST | Acknowledge active runtime alert |
| `/api/compliance/summary` | GET | Posture scores for SOC 2, ISO 27001, NIST |
| `/api/compliance/audit` | POST | Trigger continuous automated compliance audit |
| `/api/reports/export-csv` | GET | Download CSV vulnerability assessment |
| `/api/settings` | GET, PUT | Update platform policies and notifications |
| `/api/settings/integrations/{name}/test` | POST | Test connection to any of the 12 tools |
| `/api/assistant/chat` | POST | DevSecOps AI Assistant query engine |

---

## 8. Verification & Acceptance Testing

The platform satisfies all project requirements:
1. **Visual Accuracy**: Recreated dark navy sidebar, blue active nav, white workspace cards, severity badges, and dark terminal live logs.
2. **10 Functional Pages**: Dashboard, Projects, Pipelines, Security Center, App Monitor, Runtime Monitoring, Vault, Compliance, Reports, and Settings.
3. **Realistic Data**: Seeded with Netflix Clone, Netflix Web, and Pake App, real CVE IDs, and masked Vault secrets.
4. **Interactive Remediation**: Automated package patching with reviewable git diffs and live score recalculation.
5. **Security Gate Enforcement**: Mandatory gates blocking deployments on critical flaws or root container configurations.
6. **No False Claims**: Unavailable external tools report truthful status without claiming false scans.
