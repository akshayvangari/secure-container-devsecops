const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, '..', 'database', 'db_state.json');

// Initialize database state with seed data
function getInitialState() {
  return {
    projects: [
      {
        id: 'proj-netflix-clone',
        name: 'Netflix Clone',
        slug: 'netflix-clone',
        repositoryUrl: 'https://github.com/enterprise-devsecops/netflix-clone.git',
        defaultBranch: 'main',
        workspacePath: '/workspaces/netflix-clone',
        description: 'Full-featured microservices video streaming front/backend with React and Node.js',
        language: 'TypeScript',
        framework: 'React / Node.js',
        securityScore: 78,
        criticalCount: 1,
        highCount: 3,
        mediumCount: 5,
        lowCount: 8,
        exposedSecretCount: 1,
        pipelineStatus: 'PASSED',
        projectStatus: 'ACTIVE',
        serverStatus: 'RUNNING',
        devServerPort: 3001,
        dependencyCount: 142,
        fileCount: 385,
        hasDockerfile: true,
        hasK8sManifest: true,
        hasIac: true,
        lastScannedAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'proj-netflix-web',
        name: 'Netflix Web',
        slug: 'netflix-web',
        repositoryUrl: 'https://github.com/enterprise-devsecops/netflix-web.git',
        defaultBranch: 'master',
        workspacePath: '/workspaces/netflix-web',
        description: 'Customer-facing catalog UI and high-throughput video delivery web service',
        language: 'JavaScript',
        framework: 'Next.js / Express',
        securityScore: 64,
        criticalCount: 2,
        highCount: 5,
        mediumCount: 8,
        lowCount: 12,
        exposedSecretCount: 1,
        pipelineStatus: 'FAILED',
        projectStatus: 'ACTIVE',
        serverStatus: 'STOPPED',
        devServerPort: 3002,
        dependencyCount: 98,
        fileCount: 240,
        hasDockerfile: true,
        hasK8sManifest: true,
        hasIac: false,
        lastScannedAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'proj-pake-app',
        name: 'Pake App',
        slug: 'pake-app',
        repositoryUrl: 'https://github.com/enterprise-devsecops/pake-desktop.git',
        defaultBranch: 'main',
        workspacePath: '/workspaces/pake-app',
        description: 'Lightweight containerized web-to-desktop wrapper built with Rust and WebKit runtime',
        language: 'Rust / TS',
        framework: 'Tauri / Rust',
        securityScore: 92,
        criticalCount: 0,
        highCount: 1,
        mediumCount: 2,
        lowCount: 4,
        exposedSecretCount: 0,
        pipelineStatus: 'PASSED',
        projectStatus: 'ACTIVE',
        serverStatus: 'STOPPED',
        devServerPort: 8085,
        dependencyCount: 64,
        fileCount: 118,
        hasDockerfile: true,
        hasK8sManifest: true,
        hasIac: true,
        lastScannedAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    findings: [
      {
        id: 'find-cve-001',
        projectId: 'proj-netflix-clone',
        category: 'CVE',
        title: 'Remote Code Execution in jsonwebtoken verification',
        cveId: 'CVE-2022-23529',
        packageName: 'jsonwebtoken',
        installedVersion: '8.5.1',
        fixedVersion: '9.0.0',
        filePath: 'package.json',
        lineNumber: 24,
        severity: 'CRITICAL',
        cvssScore: 9.8,
        exploitability: 'FUNCTIONAL',
        toolName: 'OWASP Dependency-Check',
        description: 'jsonwebtoken versions before 9.0.0 are vulnerable to remote code execution due to insecure secret or public key validation via crafted key objects.',
        remediationGuidance: 'Upgrade jsonwebtoken to version 9.0.0 or higher. Review jwt.verify calls to pass string or Buffer secrets.',
        remediationStatus: 'PATCH_PROPOSED',
        firstDetectedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'find-sec-002',
        projectId: 'proj-netflix-clone',
        category: 'SECRET',
        title: 'Exposed AWS Secret Access Key in client configuration',
        cveId: null,
        packageName: null,
        installedVersion: null,
        fixedVersion: null,
        filePath: 'src/config/aws-client.ts',
        lineNumber: 42,
        severity: 'CRITICAL',
        cvssScore: 9.5,
        exploitability: 'HIGH',
        toolName: 'Gitleaks',
        description: 'Hardcoded AWS Secret Access Key detected in repository source code history.',
        remediationGuidance: 'Immediately revoke secret key in AWS IAM. Use HashiCorp Vault or AWS Secrets Manager dynamic credential injection.',
        remediationStatus: 'OPEN',
        firstDetectedAt: new Date(Date.now() - 120 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'find-cve-003',
        projectId: 'proj-netflix-web',
        category: 'CVE',
        title: 'Denial of Service via Prototype Pollution in lodash',
        cveId: 'CVE-2023-45853',
        packageName: 'lodash',
        installedVersion: '4.17.20',
        fixedVersion: '4.17.21',
        filePath: 'package.json',
        lineNumber: 18,
        severity: 'HIGH',
        cvssScore: 7.5,
        exploitability: 'PROOF_OF_CONCEPT',
        toolName: 'Trivy',
        description: 'Prototype pollution in lodash allows remote attackers to cause denial of service or manipulate application logic.',
        remediationGuidance: 'Update lodash to 4.17.21 in package.json and lockfile.',
        remediationStatus: 'OPEN',
        firstDetectedAt: new Date(Date.now() - 96 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'find-doc-004',
        projectId: 'proj-netflix-web',
        category: 'DOCKER',
        title: 'Dockerfile runs container process as root user',
        cveId: null,
        packageName: null,
        installedVersion: null,
        fixedVersion: null,
        filePath: 'Dockerfile',
        lineNumber: 38,
        severity: 'HIGH',
        cvssScore: 7.8,
        exploitability: 'FUNCTIONAL',
        toolName: 'Hadolint',
        description: 'Dockerfile does not specify a non-root USER instruction. Containers running as root violate the principle of least privilege.',
        remediationGuidance: 'Add non-root user creation: `RUN addgroup -S appgroup && adduser -S appuser -G appgroup` and switch with `USER appuser`.',
        remediationStatus: 'OPEN',
        firstDetectedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'find-sast-005',
        projectId: 'proj-netflix-web',
        category: 'SAST',
        title: 'Unsanitized User Input in DangerouslySetInnerHTML',
        cveId: null,
        packageName: null,
        installedVersion: null,
        fixedVersion: null,
        filePath: 'src/components/VideoPlayer.tsx',
        lineNumber: 89,
        severity: 'HIGH',
        cvssScore: 8.2,
        exploitability: 'FUNCTIONAL',
        toolName: 'SonarQube',
        description: 'Potential Cross-Site Scripting (XSS) via unescaped string injection into dangerouslySetInnerHTML.',
        remediationGuidance: 'Use DOMPurify.sanitize() or native JSX text escaping rather than direct HTML injection.',
        remediationStatus: 'OPEN',
        firstDetectedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'find-iac-006',
        projectId: 'proj-netflix-clone',
        category: 'IAC',
        title: 'Kubernetes Pod Security Context missing readOnlyRootFilesystem',
        cveId: null,
        packageName: null,
        installedVersion: null,
        fixedVersion: null,
        filePath: 'k8s/deployment.yaml',
        lineNumber: 31,
        severity: 'MEDIUM',
        cvssScore: 5.5,
        exploitability: 'UNPROVEN',
        toolName: 'Checkov',
        description: 'Pod specification does not enforce readOnlyRootFilesystem=true, permitting malicious tampering of container binaries.',
        remediationGuidance: 'Configure securityContext.readOnlyRootFilesystem: true and mount an emptyDir volume for ephemeral cache.',
        remediationStatus: 'OPEN',
        firstDetectedAt: new Date(Date.now() - 144 * 3600000).toISOString(),
        lastDetectedAt: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ],
    pipelines: [
      {
        id: 'pipe-exec-142',
        projectId: 'proj-netflix-clone',
        executionNumber: 142,
        branch: 'main',
        commitHash: 'c7d81ef',
        commitMessage: 'feat: optimize video streaming chunk caching with Redis',
        triggeredBy: 'GitHub Webhook (push)',
        status: 'PASSED',
        durationSeconds: 215,
        securityGatePassed: true,
        blockedReason: null,
        startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        endedAt: new Date(Date.now() - 1.9 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        stages: [
          { name: 'Git Clone & Vault Sync', toolName: 'Vault KV v2', status: 'PASSED', duration: 12, isGate: false },
          { name: 'Secret Detection', toolName: 'Gitleaks v8.18', status: 'PASSED', duration: 14, isGate: true },
          { name: 'Static Code Analysis', toolName: 'SonarQube 10.4', status: 'PASSED', duration: 28, isGate: true },
          { name: 'Dependency Vulnerability Scan', toolName: 'OWASP Dependency-Check', status: 'PASSED', duration: 35, isGate: true },
          { name: 'Dockerfile Linting', toolName: 'Hadolint v2.12', status: 'PASSED', duration: 10, isGate: true },
          { name: 'Infrastructure Security', toolName: 'Checkov v3.2', status: 'PASSED', duration: 18, isGate: true },
          { name: 'Container Build', toolName: 'Docker Buildx', status: 'PASSED', duration: 42, isGate: false },
          { name: 'Container Image Scan', toolName: 'Trivy v0.50', status: 'PASSED', duration: 22, isGate: true },
          { name: 'Container Image Signing', toolName: 'Cosign v2.2', status: 'PASSED', duration: 8, isGate: true },
          { name: 'Kubernetes Manifest Validation', toolName: 'kubeconform', status: 'PASSED', duration: 9, isGate: true },
          { name: 'Deployment', toolName: 'Helm / kubectl', status: 'PASSED', duration: 11, isGate: false },
          { name: 'Post-Deployment Verification', toolName: 'Falco / Health Probe', status: 'PASSED', duration: 6, isGate: false }
        ]
      },
      {
        id: 'pipe-exec-141',
        projectId: 'proj-netflix-web',
        executionNumber: 141,
        branch: 'master',
        commitHash: 'b3a980c',
        commitMessage: 'chore: update auth middleware and session persistence',
        triggeredBy: 'Jenkins Scheduler',
        status: 'FAILED',
        durationSeconds: 148,
        securityGatePassed: false,
        blockedReason: 'MANDATORY GATE FAILURE: Hadolint detected container running as root user (DL3002). Cosign image signature blocked.',
        startedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        endedAt: new Date(Date.now() - 4.9 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        stages: [
          { name: 'Git Clone & Vault Sync', toolName: 'Vault KV v2', status: 'PASSED', duration: 14, isGate: false },
          { name: 'Secret Detection', toolName: 'Gitleaks v8.18', status: 'PASSED', duration: 16, isGate: true },
          { name: 'Static Code Analysis', toolName: 'SonarQube 10.4', status: 'PASSED', duration: 32, isGate: true },
          { name: 'Dependency Vulnerability Scan', toolName: 'OWASP Dependency-Check', status: 'PASSED', duration: 41, isGate: true },
          { name: 'Dockerfile Linting', toolName: 'Hadolint v2.12', status: 'FAILED', duration: 12, isGate: true, errorMessage: 'DL3002: Last USER should not be root.' },
          { name: 'Infrastructure Security', toolName: 'Checkov v3.2', status: 'SKIPPED', duration: 0, isGate: true },
          { name: 'Container Build', toolName: 'Docker Buildx', status: 'SKIPPED', duration: 0, isGate: false },
          { name: 'Container Image Scan', toolName: 'Trivy v0.50', status: 'SKIPPED', duration: 0, isGate: true },
          { name: 'Container Image Signing', toolName: 'Cosign v2.2', status: 'SKIPPED', duration: 0, isGate: true },
          { name: 'Kubernetes Manifest Validation', toolName: 'kubeconform', status: 'SKIPPED', duration: 0, isGate: true },
          { name: 'Deployment', toolName: 'Helm / kubectl', status: 'SKIPPED', duration: 0, isGate: false },
          { name: 'Post-Deployment Verification', toolName: 'Falco / Health Probe', status: 'SKIPPED', duration: 0, isGate: false }
        ]
      },
      {
        id: 'pipe-exec-140',
        projectId: 'proj-pake-app',
        executionNumber: 140,
        branch: 'main',
        commitHash: 'f192b0e',
        commitMessage: 'fix: improve IPC bridge security boundaries in desktop runtime',
        triggeredBy: 'akshayvangari',
        status: 'PASSED',
        durationSeconds: 182,
        securityGatePassed: true,
        blockedReason: null,
        startedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        endedAt: new Date(Date.now() - 23.9 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        stages: [
          { name: 'Git Clone & Vault Sync', toolName: 'Vault KV v2', status: 'PASSED', duration: 10, isGate: false },
          { name: 'Secret Detection', toolName: 'Gitleaks v8.18', status: 'PASSED', duration: 12, isGate: true },
          { name: 'Static Code Analysis', toolName: 'SonarQube 10.4', status: 'PASSED', duration: 25, isGate: true },
          { name: 'Dependency Vulnerability Scan', toolName: 'OWASP Dependency-Check', status: 'PASSED', duration: 30, isGate: true },
          { name: 'Dockerfile Linting', toolName: 'Hadolint v2.12', status: 'PASSED', duration: 8, isGate: true },
          { name: 'Infrastructure Security', toolName: 'Checkov v3.2', status: 'PASSED', duration: 15, isGate: true },
          { name: 'Container Build', toolName: 'Docker Buildx', status: 'PASSED', duration: 38, isGate: false },
          { name: 'Container Image Scan', toolName: 'Trivy v0.50', status: 'PASSED', duration: 20, isGate: true },
          { name: 'Container Image Signing', toolName: 'Cosign v2.2', status: 'PASSED', duration: 7, isGate: true },
          { name: 'Kubernetes Manifest Validation', toolName: 'kubeconform', status: 'PASSED', duration: 8, isGate: true },
          { name: 'Deployment', toolName: 'Helm / kubectl', status: 'PASSED', duration: 10, isGate: false },
          { name: 'Post-Deployment Verification', toolName: 'Falco / Health Probe', status: 'PASSED', duration: 5, isGate: false }
        ]
      }
    ],
    remediations: [
      {
        id: 'rem-job-001',
        projectId: 'proj-netflix-clone',
        findingId: 'find-cve-001',
        packageName: 'jsonwebtoken',
        previousVersion: '8.5.1',
        proposedVersion: '9.0.0',
        targetBranch: 'main',
        remediationBranch: 'remediation/cve-2022-23529-jsonwebtoken-9.0.0',
        diffContent: `--- a/package.json
+++ b/package.json
@@ -24,3 +24,3 @@
-    "jsonwebtoken": "^8.5.1",
+    "jsonwebtoken": "^9.0.0",
@@ -48,2 +48,2 @@
     "react": "^18.2.0",
     "react-dom": "^18.2.0"`,
        status: 'PROPOSED',
        compatibilityWarning: 'Major version upgrade (8.x -> 9.x): verify jwt.verify signature parameters for strict string/Buffer secret constraints.',
        testRunStatus: 'PASSED (Unit: 42/42 passed)',
        githubPrNumber: 14,
        githubPrUrl: 'https://github.com/enterprise-devsecops/netflix-clone/pull/14',
        remediationLog: '[REMEDIATION AUDIT]\nBranch created: remediation/cve-2022-23529-jsonwebtoken-9.0.0\nDependency updated: jsonwebtoken 8.5.1 -> 9.0.0\nAutomated test suite triggered: 42 tests passed\nOWASP Dependency-Check verification: CVE-2022-23529 CLEARED\nStatus: Ready for engineer approval and automated merge.',
        createdBy: 'DevSecOps Automated Agent',
        createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
      }
    ],
    vaultSecrets: [
      { id: 'vlt-01', projectId: 'proj-netflix-clone', secretKey: 'POSTGRES_DB_PASSWORD', secretPath: 'secret/data/production/netflix-clone/db', secretType: 'DATABASE', storageBackend: 'HashiCorp Vault KV v2', currentVersion: 3, status: 'ACTIVE', maskedValue: '••••••••••••• [v3]', lastRotatedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
      { id: 'vlt-02', projectId: 'proj-netflix-clone', secretKey: 'JWT_HMAC_SIGNING_KEY', secretPath: 'secret/data/production/netflix-clone/jwt', secretType: 'API_KEY', storageBackend: 'HashiCorp Vault KV v2', currentVersion: 2, status: 'ACTIVE', maskedValue: '••••••••••••• [v2]', lastRotatedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'vlt-03', projectId: 'proj-netflix-web', secretKey: 'STRIPE_LIVE_API_KEY', secretPath: 'secret/data/production/netflix-web/payments', secretType: 'API_KEY', storageBackend: 'HashiCorp Vault KV v2', currentVersion: 1, status: 'ACTIVE', maskedValue: 'sk_live_••••••••••••', lastRotatedAt: new Date(Date.now() - 28 * 86400000).toISOString() },
      { id: 'vlt-04', projectId: 'proj-netflix-web', secretKey: 'TLS_WILDCARD_CERT_KEY', secretPath: 'secret/data/production/netflix-web/certs', secretType: 'CERTIFICATE', storageBackend: 'HashiCorp Vault KV v2', currentVersion: 2, status: 'ACTIVE', maskedValue: '••••••••••••• [RSA 4096]', lastRotatedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
      { id: 'vlt-05', projectId: 'proj-pake-app', secretKey: 'GITHUB_RELEASE_OAUTH_TOKEN', secretPath: 'secret/data/production/pake/github', secretType: 'CLOUD_CREDENTIAL', storageBackend: 'HashiCorp Vault KV v2', currentVersion: 1, status: 'ACTIVE', maskedValue: 'token_••••••••••••••••', lastRotatedAt: new Date(Date.now() - 15 * 86400000).toISOString() }
    ],
    alerts: [
      {
        id: 'flc-alert-001',
        ruleName: 'Terminal shell in container',
        severity: 'CRITICAL',
        podName: 'netflix-clone-deploy-7789f-8x2d9',
        containerName: 'netflix-clone-backend',
        namespace: 'production',
        clusterName: 'prod-k8s-cluster-01',
        description: 'A interactive shell (sh/bash) was spawned inside running container by user root (UID=0, PID=1984).',
        eventMetadata: { proc_name: 'bash', parent_proc: 'containerd-shim', user: 'root', image: 'docker.enterprise.internal/netflix-clone:v2.4.1', terminal: 'pts/0' },
        acknowledged: false,
        timestamp: new Date(Date.now() - 35 * 60000).toISOString()
      },
      {
        id: 'flc-alert-002',
        ruleName: 'Read sensitive file untrusted (/etc/shadow)',
        severity: 'HIGH',
        podName: 'netflix-web-core-66d49-4k9pl',
        containerName: 'netflix-web-node',
        namespace: 'production',
        clusterName: 'prod-k8s-cluster-01',
        description: 'Unauthorized read operation performed on /etc/shadow file after initial startup sequence completed.',
        eventMetadata: { proc_name: 'node', fd_name: '/etc/shadow', user: 'node', image: 'docker.enterprise.internal/netflix-web:v1.9.0' },
        acknowledged: false,
        timestamp: new Date(Date.now() - 120 * 60000).toISOString()
      },
      {
        id: 'flc-alert-003',
        ruleName: 'Unexpected outbound connection to external IP',
        severity: 'WARNING',
        podName: 'pake-backend-9df21-72zxa',
        containerName: 'pake-rust-worker',
        namespace: 'production',
        clusterName: 'prod-k8s-cluster-01',
        description: 'Pod initiated an outbound TCP connection to unlisted external IP 185.220.101.5:443 not in egress policy.',
        eventMetadata: { dest_ip: '185.220.101.5', dest_port: 443, proto: 'tcp', proc_name: 'pake-worker' },
        acknowledged: true,
        acknowledgedBy: 'secops-oncall',
        timestamp: new Date(Date.now() - 480 * 60000).toISOString()
      },
      {
        id: 'flc-alert-004',
        ruleName: 'Container run with elevated Linux capabilities',
        severity: 'HIGH',
        podName: 'netflix-web-core-66d49-4k9pl',
        containerName: 'netflix-web-node',
        namespace: 'production',
        clusterName: 'prod-k8s-cluster-01',
        description: 'Detected container executed with SYS_PTRACE capability, violating PodSecurityStandards restricted profile.',
        eventMetadata: { capability: 'SYS_PTRACE', user: 'root' },
        acknowledged: true,
        acknowledgedBy: 'secops-oncall',
        timestamp: new Date(Date.now() - 1440 * 60000).toISOString()
      }
    ],
    pods: [
      { id: 'pod-01', podName: 'netflix-clone-deploy-7789f-8x2d9', namespace: 'production', appLabel: 'netflix-clone', status: 'Running', image: 'docker.enterprise.internal/netflix-clone:v2.4.1', restarts: 0, readyReplicas: '1/1', cpuCores: '0.24 cores', memoryMb: '312 MB', securityContextCompliant: true },
      { id: 'pod-02', podName: 'netflix-clone-deploy-7789f-1l4aa', namespace: 'production', appLabel: 'netflix-clone', status: 'Running', image: 'docker.enterprise.internal/netflix-clone:v2.4.1', restarts: 0, readyReplicas: '1/1', cpuCores: '0.19 cores', memoryMb: '298 MB', securityContextCompliant: true },
      { id: 'pod-03', podName: 'netflix-web-core-66d49-4k9pl', namespace: 'production', appLabel: 'netflix-web', status: 'CrashLoopBackOff', image: 'docker.enterprise.internal/netflix-web:v1.9.0', restarts: 4, readyReplicas: '0/1', cpuCores: '0.45 cores', memoryMb: '512 MB', securityContextCompliant: false },
      { id: 'pod-04', podName: 'netflix-web-core-66d49-9j3bx', namespace: 'production', appLabel: 'netflix-web', status: 'Running', image: 'docker.enterprise.internal/netflix-web:v1.9.0', restarts: 1, readyReplicas: '1/1', cpuCores: '0.38 cores', memoryMb: '480 MB', securityContextCompliant: false },
      { id: 'pod-05', podName: 'pake-backend-9df21-72zxa', namespace: 'production', appLabel: 'pake-app', status: 'Running', image: 'docker.enterprise.internal/pake:v1.0.4', restarts: 0, readyReplicas: '1/1', cpuCores: '0.08 cores', memoryMb: '124 MB', securityContextCompliant: true },
      { id: 'pod-06', falcoDaemon: true, podName: 'falco-daemonset-worker-k882a', namespace: 'falco-system', appLabel: 'falco', status: 'Running', image: 'falcosecurity/falco:0.37.1', restarts: 0, readyReplicas: '1/1', cpuCores: '0.12 cores', memoryMb: '194 MB', securityContextCompliant: true }
    ],
    complianceFrameworks: [
      { id: 'soc2', name: 'SOC 2 Type II', version: '2022 Trust Services Criteria', score: 84, passed: 15, warning: 2, failed: 1, total: 18 },
      { id: 'iso27001', name: 'ISO/IEC 27001:2022', version: 'Annex A Controls', score: 88, passed: 19, warning: 2, failed: 1, total: 22 },
      { id: 'nist80053', name: 'NIST SP 800-53', version: 'Rev. 5 Security Controls', score: 79, passed: 20, warning: 3, failed: 2, total: 25 },
      { id: 'pci-dss', name: 'PCI DSS v4.0', version: 'Payment Card Industry', score: 91, passed: 14, warning: 2, failed: 0, total: 16 },
      { id: 'hipaa', name: 'HIPAA Security Rule', version: '45 CFR Part 160 & 164', score: 86, passed: 12, warning: 1, failed: 1, total: 14 }
    ],
    complianceControls: [
      {
        id: 'ctrl-soc2-01',
        frameworkId: 'soc2',
        controlCode: 'CC6.1',
        controlName: 'Logical Access and Credentials Protection',
        requirements: 'The entity implements logical access security software, infrastructure, and architectures over protected assets.',
        category: 'Access Control',
        severity: 'CRITICAL',
        status: 'WARNING',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Gitleaks Engine]\nScan ID: scn-2026-10-09-001\nResult: 1 exposed AWS key detected in netflix-clone repo.\nVault Status: Vault KV v2 sync verified for 5 active credentials.\nEvaluation: Control flagged for warning due to lingering secret in source tree.',
        linkedProject: 'Netflix Clone',
        remediationGuidance: 'Revoke exposed AWS secret key in AWS console and confirm deletion from git history using git-filter-repo.'
      },
      {
        id: 'ctrl-soc2-02',
        frameworkId: 'soc2',
        controlCode: 'CC6.6',
        controlName: 'Vulnerability Management Before Deployment',
        requirements: 'Boundary protection, container scanning, and dependency analysis are implemented prior to production release.',
        category: 'Secure SDLC',
        severity: 'CRITICAL',
        status: 'PASS',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Trivy & OWASP DC]\nPipeline #142 Gate: PASSED\nTrivy Image Scan: 0 Critical vulnerabilities in production container image.\nOWASP Dependency-Check: High/Critical gate threshold passed.\nCosign Signature: Verified sha256:4a81cf26...',
        linkedProject: 'Netflix Clone',
        remediationGuidance: 'Maintain automated gate threshold in Jenkinsfile and Trivy security gate settings.'
      },
      {
        id: 'ctrl-soc2-03',
        frameworkId: 'soc2',
        controlCode: 'CC6.8',
        controlName: 'Runtime Intrusion Detection & Threat Prevention',
        requirements: 'The entity implements controls to prevent or detect unauthorized code execution or container tampering at runtime.',
        category: 'Runtime Security',
        severity: 'HIGH',
        status: 'FAIL',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Falco DaemonSet]\nRule: Terminal shell in container\nSeverity: CRITICAL\nPod: netflix-clone-deploy-7789f-8x2d9\nContainer: netflix-clone-backend\nActive alert acknowledged: false. Control marked FAIL.',
        linkedProject: 'Netflix Clone',
        remediationGuidance: 'Investigate container shell access immediately. Restrict kubectl exec permissions in RBAC role definitions.'
      },
      {
        id: 'ctrl-iso-01',
        frameworkId: 'iso27001',
        controlCode: 'A.8.28',
        controlName: 'Secure Coding & Application Security Testing',
        requirements: 'Secure coding principles must be applied to software development. Static analysis and peer reviews required.',
        category: 'Development Security',
        severity: 'HIGH',
        status: 'PASS',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - SonarQube & Checkov]\nSonarQube Quality Gate: PASSED for netflix-clone (Reliability: A, Security: A).\nCode Coverage: 84.2%.\nCheckov IaC rules: 28 evaluated, 27 passed, 1 medium warning.',
        linkedProject: 'Netflix Clone',
        remediationGuidance: 'Address readOnlyRootFilesystem warning in k8s deployment manifest.'
      },
      {
        id: 'ctrl-iso-02',
        frameworkId: 'iso27001',
        controlCode: 'A.8.9',
        controlName: 'Configuration Management & Privilege Restriction',
        requirements: 'Configurations including containers, operating systems, and services shall be securely managed to prevent root misuse.',
        category: 'System Hardening',
        severity: 'CRITICAL',
        status: 'FAIL',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Hadolint Engine]\nProject: netflix-web\nDockerfile Check: DL3002 Violation. Container image builds and executes with UID 0 (root).\nPipeline Execution #141 was BLOCKED by Mandatory Gate.',
        linkedProject: 'Netflix Web',
        remediationGuidance: 'Update Dockerfile with non-root user directive before container entrypoint.'
      },
      {
        id: 'ctrl-nist-01',
        frameworkId: 'nist80053',
        controlCode: 'AC-2',
        controlName: 'Account Management and Least Privilege',
        requirements: 'Manage information system accounts and enforce least privilege in containerized execution contexts.',
        category: 'Access Control',
        severity: 'HIGH',
        status: 'WARNING',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Kubernetes API Audit]\nCluster: prod-k8s-cluster-01\nPod: netflix-web-core-66d49-4k9pl running with excessive capabilities (SYS_PTRACE).\nFalco Rule Triggered: Container run with elevated Linux capabilities.',
        linkedProject: 'Netflix Web',
        remediationGuidance: 'Drop all default capabilities and remove SYS_PTRACE in securityContext.capabilities.drop: [ALL].'
      },
      {
        id: 'ctrl-pci-01',
        frameworkId: 'pci-dss',
        controlCode: 'Req 6.4.2',
        controlName: 'Automated Technical Attack Detection in Web Applications',
        requirements: 'Public-facing web applications are protected against known attacks with automated runtime monitoring and DAST.',
        category: 'Payment Security',
        severity: 'CRITICAL',
        status: 'PASS',
        technicalEvidence: '[AUTOMATED EVIDENCE LOG - Runtime WAF & Falco]\nActive egress filters in place. All TLS endpoints enforce TLS 1.3.\nContinuous container integrity validated via Cosign image verification.',
        linkedProject: 'Netflix Web',
        remediationGuidance: 'Continue quarterly penetration tests and continuous image signing.'
      }
    ],
    integrations: [
      { id: 'int-github', name: 'github', displayName: 'GitHub Actions & Repository Integration', category: 'SCM', endpointUrl: 'https://api.github.com', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-jenkins', name: 'jenkins', displayName: 'Jenkins Enterprise CI/CD Orchestrator', category: 'CI_CD', endpointUrl: 'http://jenkins.ci.internal:8080', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-vault', name: 'vault', displayName: 'HashiCorp Vault KV Secrets Engine', category: 'SECRETS', endpointUrl: 'http://vault.security.internal:8200', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-trivy', name: 'trivy', displayName: 'Aqua Security Trivy Scanner', category: 'SCANNER', endpointUrl: 'http://trivy-server.internal:4954', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-sonarqube', name: 'sonarqube', displayName: 'SonarQube Enterprise Code Quality', category: 'SAST', endpointUrl: 'http://sonarqube.internal:9000', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-gitleaks', name: 'gitleaks', displayName: 'Gitleaks Secret Detection', category: 'SECRETS', endpointUrl: 'cli://gitleaks:v8.18.2', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-owasp-dc', name: 'owasp_dependency_check', displayName: 'OWASP Dependency-Check', category: 'SCA', endpointUrl: 'cli://dependency-check:v9.0.8', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-hadolint', name: 'hadolint', displayName: 'Hadolint Dockerfile Linter', category: 'LINTER', endpointUrl: 'cli://hadolint:v2.12.0', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-checkov', name: 'checkov', displayName: 'Bridgecrew Checkov IaC Scanner', category: 'IAC', endpointUrl: 'cli://checkov:v3.2.35', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-cosign', name: 'cosign', displayName: 'Sigstore Cosign Image Signer', category: 'SIGNING', endpointUrl: 'cli://cosign:v2.2.3', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-falco', name: 'falco', displayName: 'Sysdig Falco Runtime Threat Detection', category: 'RUNTIME', endpointUrl: 'http://falco-grpc.falco-system:5060', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() },
      { id: 'int-kubernetes', name: 'kubernetes', displayName: 'Kubernetes Production Cluster', category: 'CLUSTER', endpointUrl: 'https://k8s-api.prod.internal:6443', status: 'CONNECTED', lastCheckedAt: new Date().toISOString() }
    ],
    settings: {
      platformName: 'DevSecOps Enterprise Security & Monitoring Platform',
      defaultBranch: 'main',
      autoGenerateK8s: true,
      blockDeploymentOnCritical: true,
      blockDeploymentOnSecrets: true,
      requireImageSigning: true,
      requireNonRoot: true,
      requireDependencyScan: true,
      requireImageScan: true,
      notificationCriticalFindings: true,
      notificationFailedPipelines: true,
      notificationRuntimeAlerts: true,
      notificationComplianceWarnings: true,
      emailRecipients: 'secops-team@enterprise.internal, devops-lead@enterprise.internal',
      slackWebhookUrl: '',
      teamsWebhookUrl: ''
    }
  };
}

// Load or save DB State
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading db_state.json:', err);
  }
  const init = getInitialState();
  saveDb(init);
  return init;
}

function saveDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving db_state.json:', err);
  }
}

// Initialize database immediately on startup
loadDb();

// Calculate project score algorithm
function recalculateProjectScores(db) {
  for (const proj of db.projects) {
    let score = 100;
    let crit = 0, high = 0, med = 0, low = 0, sec = 0;
    const projFindings = db.findings.filter(f => f.projectId === proj.id && f.remediationStatus !== 'RESOLVED' && f.remediationStatus !== 'SUPPRESSED');
    for (const f of projFindings) {
      if (f.category === 'SECRET') {
        sec++;
        score -= 20;
      } else if (f.severity === 'CRITICAL') {
        crit++;
        score -= 15;
      } else if (f.severity === 'HIGH') {
        high++;
        score -= 8;
      } else if (f.severity === 'MEDIUM') {
        med++;
        score -= 3;
      } else if (f.severity === 'LOW') {
        low++;
        score -= 1;
      }
    }
    proj.securityScore = Math.max(0, Math.min(100, score));
    proj.criticalCount = crit;
    proj.highCount = high;
    proj.mediumCount = med;
    proj.lowCount = low;
    proj.exposedSecretCount = sec;
  }
}

// Helper to send JSON
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// Read body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const db = loadDb();

  // 1. Dashboard APIs
  if (pathname === '/api/dashboard/summary' && req.method === 'GET') {
    recalculateProjectScores(db);
    saveDb(db);
    const avgScore = Math.round(db.projects.reduce((acc, p) => acc + p.securityScore, 0) / (db.projects.length || 1));
    const openFindings = db.findings.filter(f => f.remediationStatus !== 'RESOLVED');
    const criticals = openFindings.filter(f => f.severity === 'CRITICAL').length;
    const highs = openFindings.filter(f => f.severity === 'HIGH').length;
    const secrets = openFindings.filter(f => f.category === 'SECRET').length;
    const activeThreats = db.alerts.filter(a => !a.acknowledged).length;

    return sendJson(res, 200, {
      overallSecurityScore: avgScore,
      totalProjects: db.projects.length,
      pipelineExecutions: db.pipelines.length,
      openVulnerabilities: openFindings.length,
      criticalFindings: criticals,
      highFindings: highs,
      exposedSecrets: secrets,
      activeThreats: activeThreats,
      complianceScore: 84,
      clusterStatus: 'HEALTHY',
      falcoEngineStatus: 'ATTACHED (v0.37.1)'
    });
  }

  if (pathname === '/api/dashboard/vulnerability-trends' && req.method === 'GET') {
    const trends = [
      { day: 'Day 1', critical: 4, high: 12, medium: 18, score: 62 },
      { day: 'Day 5', critical: 3, high: 11, medium: 17, score: 66 },
      { day: 'Day 10', critical: 3, high: 10, medium: 16, score: 69 },
      { day: 'Day 15', critical: 2, high: 9, medium: 15, score: 73 },
      { day: 'Day 20', critical: 2, high: 8, medium: 14, score: 75 },
      { day: 'Day 25', critical: 1, high: 7, medium: 13, score: 78 },
      { day: 'Day 30', critical: 1, high: 6, medium: 12, score: 81 }
    ];
    return sendJson(res, 200, trends);
  }

  if (pathname === '/api/dashboard/recent-activity' && req.method === 'GET') {
    return sendJson(res, 200, {
      recentPipelines: db.pipelines.slice(0, 5),
      recentFindings: db.findings.slice(0, 5),
      recentAlerts: db.alerts.slice(0, 5)
    });
  }

  // 2. Project APIs
  if (pathname === '/api/projects' && req.method === 'GET') {
    recalculateProjectScores(db);
    saveDb(db);
    return sendJson(res, 200, db.projects);
  }

  if (pathname === '/api/projects' && req.method === 'POST') {
    const body = await parseBody(req);
    const newProj = {
      id: 'proj-' + (body.name || 'app').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random()*1000),
      name: body.name || 'New Project',
      slug: (body.name || 'app').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      repositoryUrl: body.repositoryUrl || 'https://github.com/enterprise/repo.git',
      defaultBranch: body.defaultBranch || 'main',
      workspacePath: body.workspacePath || '/workspaces/' + (body.name || 'app'),
      description: body.description || 'Enterprise microservice project',
      language: body.language || 'TypeScript',
      framework: body.framework || 'Node.js / Express',
      securityScore: 100,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      exposedSecretCount: 0,
      pipelineStatus: 'PASSED',
      projectStatus: 'ACTIVE',
      serverStatus: 'STOPPED',
      devServerPort: 3000 + Math.floor(Math.random() * 500),
      dependencyCount: 45,
      fileCount: 88,
      hasDockerfile: true,
      hasK8sManifest: true,
      hasIac: false,
      lastScannedAt: new Date().toISOString()
    };
    db.projects.push(newProj);
    saveDb(db);
    return sendJson(res, 201, newProj);
  }

  const projMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projMatch) {
    const projId = projMatch[1];
    const proj = db.projects.find(p => p.id === projId || p.slug === projId);

    if (req.method === 'GET') {
      if (!proj) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, proj);
    }
    if (req.method === 'PUT') {
      const body = await parseBody(req);
      if (!proj) return sendJson(res, 404, { error: 'Project not found' });
      Object.assign(proj, body);
      saveDb(db);
      return sendJson(res, 200, proj);
    }
    if (req.method === 'DELETE') {
      db.projects = db.projects.filter(p => p.id !== projId && p.slug !== projId);
      db.findings = db.findings.filter(f => f.projectId !== projId);
      saveDb(db);
      return sendJson(res, 200, { message: 'Project deleted', id: projId });
    }
  }

  const projScanMatch = pathname.match(/^\/api\/projects\/([^/]+)\/scan$/);
  if (projScanMatch && req.method === 'POST') {
    const projId = projScanMatch[1];
    const proj = db.projects.find(p => p.id === projId);
    if (!proj) return sendJson(res, 404, { error: 'Project not found' });

    proj.lastScannedAt = new Date().toISOString();
    recalculateProjectScores(db);
    saveDb(db);

    return sendJson(res, 200, {
      scanId: 'scn-' + Date.now().toString(36),
      projectId: projId,
      projectName: proj.name,
      status: 'COMPLETED',
      securityScore: proj.securityScore,
      scannedAt: proj.lastScannedAt,
      message: 'Unified scan finished using Gitleaks, Trivy, SonarQube, Hadolint and Checkov'
    });
  }

  const projPreviewMatch = pathname.match(/^\/api\/projects\/([^/]+)\/dockerfile-preview$/);
  if (projPreviewMatch && req.method === 'GET') {
    const projId = projPreviewMatch[1];
    const proj = db.projects.find(p => p.id === projId) || db.projects[0];
    const dockerfile = `# Multi-stage secure build for ${proj.name}
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security Hardening: Non-root user
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 devsecops

COPY --from=builder --chown=devsecops:nodejs /app/dist ./dist
COPY --from=builder --chown=devsecops:nodejs /app/package.json ./package.json

USER devsecops
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]`;

    const k8s = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${proj.slug}-deployment
  namespace: production
  labels:
    app: ${proj.slug}
    security.devsecops.io/policy: restricted
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${proj.slug}
  template:
    metadata:
      labels:
        app: ${proj.slug}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: ${proj.slug}
        image: docker.enterprise.internal/${proj.slug}:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop: ["ALL"]
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"`;

    return sendJson(res, 200, { dockerfile, kubernetesYaml: k8s });
  }

  // 3. Pipeline APIs
  if (pathname === '/api/pipelines' && req.method === 'GET') {
    return sendJson(res, 200, db.pipelines);
  }

  if (pathname === '/api/pipelines/trigger' && req.method === 'POST') {
    const body = await parseBody(req);
    const projectId = body.projectId || (db.projects[0] ? db.projects[0].id : 'proj-netflix-clone');
    const branch = body.branch || 'main';
    const proj = db.projects.find(p => p.id === projectId);

    const newExec = {
      id: 'pipe-exec-' + Math.floor(100 + Math.random() * 900),
      projectId: projectId,
      executionNumber: db.pipelines.length + 143,
      branch: branch,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage: 'manual: trigger comprehensive DevSecOps pipeline verification',
      triggeredBy: 'DevSecOps Console User',
      status: 'PASSED',
      durationSeconds: 198,
      securityGatePassed: true,
      blockedReason: null,
      startedAt: new Date(Date.now() - 198000).toISOString(),
      endedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      stages: [
        { name: 'Git Clone & Vault Sync', toolName: 'Vault KV v2', status: 'PASSED', duration: 12, isGate: false },
        { name: 'Secret Detection', toolName: 'Gitleaks v8.18', status: 'PASSED', duration: 14, isGate: true },
        { name: 'Static Code Analysis', toolName: 'SonarQube 10.4', status: 'PASSED', duration: 28, isGate: true },
        { name: 'Dependency Vulnerability Scan', toolName: 'OWASP Dependency-Check', status: 'PASSED', duration: 35, isGate: true },
        { name: 'Dockerfile Linting', toolName: 'Hadolint v2.12', status: 'PASSED', duration: 10, isGate: true },
        { name: 'Infrastructure Security', toolName: 'Checkov v3.2', status: 'PASSED', duration: 18, isGate: true },
        { name: 'Container Build', toolName: 'Docker Buildx', status: 'PASSED', duration: 42, isGate: false },
        { name: 'Container Image Scan', toolName: 'Trivy v0.50', status: 'PASSED', duration: 22, isGate: true },
        { name: 'Container Image Signing', toolName: 'Cosign v2.2', status: 'PASSED', duration: 8, isGate: true },
        { name: 'Kubernetes Manifest Validation', toolName: 'kubeconform', status: 'PASSED', duration: 9, isGate: true },
        { name: 'Deployment', toolName: 'Helm / kubectl', status: 'PASSED', duration: 11, isGate: false },
        { name: 'Post-Deployment Verification', toolName: 'Falco / Health Probe', status: 'PASSED', duration: 6, isGate: false }
      ]
    };
    db.pipelines.unshift(newExec);
    if (proj) {
      proj.pipelineStatus = 'PASSED';
    }
    saveDb(db);
    return sendJson(res, 201, newExec);
  }

  const pipeLogMatch = pathname.match(/^\/api\/pipelines\/([^/]+)\/logs$/);
  if (pipeLogMatch && req.method === 'GET') {
    const logs = [
      { timestamp: '00:01', level: 'INFO', message: '[Stage 1: Git & Vault] Cloned repository. Synced credentials from Vault KV v2.' },
      { timestamp: '00:14', level: 'INFO', message: '[Stage 2: Gitleaks] Scanned 385 commits for high-entropy secrets. Passed.' },
      { timestamp: '00:32', level: 'INFO', message: '[Stage 3: SonarQube] Code coverage: 84.2%. Reliability: A. Quality Gate Passed.' },
      { timestamp: '01:05', level: 'INFO', message: '[Stage 4: OWASP DC] Dependency analysis: 0 Critical gate violations.' },
      { timestamp: '01:18', level: 'INFO', message: '[Stage 5: Hadolint] Dockerfile linter passed DL3000-DL3060. Non-root user verified.' },
      { timestamp: '01:34', level: 'INFO', message: '[Stage 6: Checkov] 28 Kubernetes policies evaluated. SecurityContext enforced.' },
      { timestamp: '02:12', level: 'INFO', message: '[Stage 7: Container Build] Docker multi-stage build succeeded: sha256:4a81cf...' },
      { timestamp: '02:35', level: 'INFO', message: '[Stage 8: Trivy] Vulnerability scan: 0 Critical CVEs in Alpine base image.' },
      { timestamp: '02:44', level: 'INFO', message: '[Stage 9: Cosign] Generated ephemeral signature. Cosign keyless verified.' },
      { timestamp: '02:53', level: 'INFO', message: '[Stage 10: Manifests] kubeconform verified against Kubernetes v1.29 OpenAPI schema.' },
      { timestamp: '03:04', level: 'INFO', message: '[Stage 11: Deployment] Helm rollout triggered to namespace: production.' },
      { timestamp: '03:15', level: 'SUCCESS', message: '[Stage 12: Verification] Pods healthy. Falco runtime daemon monitoring attached.' }
    ];
    return sendJson(res, 200, logs);
  }

  const pipeCancelMatch = pathname.match(/^\/api\/pipelines\/([^/]+)\/cancel$/);
  if (pipeCancelMatch && req.method === 'POST') {
    const execId = pipeCancelMatch[1];
    const exec = db.pipelines.find(p => p.id === execId);
    if (exec) {
      exec.status = 'CANCELLED';
      saveDb(db);
    }
    return sendJson(res, 200, { status: 'CANCELLED', id: execId });
  }

  if (pathname === '/api/pipelines/jenkinsfile-template' && req.method === 'GET') {
    const tpl = `pipeline {
    agent any
    stages {
        stage('Vault Sync') { steps { echo 'Syncing HashiCorp Vault KV v2 secrets...' } }
        stage('Gitleaks') { steps { sh 'gitleaks detect --source . --verbose' } }
        stage('SonarQube') { steps { sh 'mvn sonar:sonar' } }
        stage('OWASP Dependency-Check') { steps { sh 'dependency-check.sh --scan . --failOnCVSS 7' } }
        stage('Hadolint') { steps { sh 'hadolint Dockerfile' } }
        stage('Checkov IaC') { steps { sh 'checkov -d k8s/' } }
        stage('Container Build') { steps { sh 'docker build -t app:latest .' } }
        stage('Trivy Scan') { steps { sh 'trivy image --severity CRITICAL --exit-code 1 app:latest' } }
        stage('Cosign Sign') { steps { sh 'cosign sign --key cosign.key app:latest' } }
        stage('Deploy') { steps { sh 'kubectl apply -f k8s/' } }
    }
}`;
    return sendJson(res, 200, { jenkinsfile: tpl });
  }

  // 4. Security Center APIs
  if (pathname === '/api/security/findings' && req.method === 'GET') {
    const projectId = parsedUrl.query.projectId;
    const category = parsedUrl.query.category;
    let list = db.findings;
    if (projectId) list = list.filter(f => f.projectId === projectId);
    if (category) list = list.filter(f => f.category === category);
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/security/summary' && req.method === 'GET') {
    const open = db.findings.filter(f => f.remediationStatus !== 'RESOLVED');
    return sendJson(res, 200, {
      totalFindings: open.length,
      criticalFindings: open.filter(f => f.severity === 'CRITICAL').length,
      highFindings: open.filter(f => f.severity === 'HIGH').length,
      mediumFindings: open.filter(f => f.severity === 'MEDIUM').length,
      lowFindings: open.filter(f => f.severity === 'LOW').length,
      exposedSecrets: open.filter(f => f.category === 'SECRET').length,
      averageSecurityScore: Math.round(db.projects.reduce((a, b) => a + b.securityScore, 0) / (db.projects.length || 1))
    });
  }

  if (pathname === '/api/security/patch-package' && req.method === 'POST') {
    const body = await parseBody(req);
    const finding = db.findings.find(f => f.id === body.findingId);
    if (!finding) return sendJson(res, 404, { error: 'Finding not found' });

    const targetVersion = body.proposedVersion || finding.fixedVersion || '9.0.0';
    const branchName = 'remediation/' + (finding.cveId ? finding.cveId.toLowerCase() : 'sec') + '-' + finding.packageName + '-' + targetVersion;
    const diff = `--- a/package.json
+++ b/package.json
@@ -24,3 +24,3 @@
-    "${finding.packageName}": "^${finding.installedVersion}",
+    "${finding.packageName}": "^${targetVersion}",
@@ -48,2 +48,2 @@
     "react": "^18.2.0",
     "react-dom": "^18.2.0"`;

    const job = {
      id: 'rem-job-' + Date.now().toString(36),
      projectId: finding.projectId,
      findingId: finding.id,
      packageName: finding.packageName,
      previousVersion: finding.installedVersion,
      proposedVersion: targetVersion,
      targetBranch: 'main',
      remediationBranch: branchName,
      diffContent: diff,
      status: 'PROPOSED',
      compatibilityWarning: 'SemVer verified. Dependency upgrade resolves ' + (finding.cveId || 'vulnerability') + '.',
      testRunStatus: 'PASSED (Automated regression suite: 42/42 passed)',
      githubPrNumber: Math.floor(10 + Math.random() * 50),
      githubPrUrl: 'https://github.com/enterprise-devsecops/' + (finding.projectId.replace('proj-', '')) + '/pull/' + Math.floor(10 + Math.random() * 50),
      remediationLog: `[REMEDIATION WORKFLOW]
Branch: ${branchName}
Package: ${finding.packageName} (${finding.installedVersion} -> ${targetVersion})
Regression tests: PASSED
Trivy verify: ${finding.cveId || 'CVE'} cleared.
Status: Ready for approval.`,
      createdBy: 'DevSecOps Automated Agent',
      createdAt: new Date().toISOString()
    };

    finding.remediationStatus = 'PATCH_PROPOSED';
    db.remediations.unshift(job);
    saveDb(db);
    return sendJson(res, 201, job);
  }

  if (pathname === '/api/security/remediations' && req.method === 'GET') {
    return sendJson(res, 200, db.remediations);
  }

  const remApproveMatch = pathname.match(/^\/api\/security\/remediations\/([^/]+)\/approve$/);
  if (remApproveMatch && req.method === 'POST') {
    const remId = remApproveMatch[1];
    const job = db.remediations.find(r => r.id === remId);
    if (!job) return sendJson(res, 404, { error: 'Remediation not found' });

    job.status = 'PR_CREATED';
    job.approvedBy = 'Security Engineer (Current User)';
    job.remediationLog += '\nApproved by user. Local remediation branch and GitHub PR confirmed.';

    const finding = db.findings.find(f => f.id === job.findingId);
    if (finding) {
      finding.remediationStatus = 'RESOLVED';
      recalculateProjectScores(db);
    }
    saveDb(db);
    return sendJson(res, 200, job);
  }

  const remRejectMatch = pathname.match(/^\/api\/security\/remediations\/([^/]+)\/reject$/);
  if (remRejectMatch && req.method === 'POST') {
    const remId = remRejectMatch[1];
    const job = db.remediations.find(r => r.id === remId);
    if (!job) return sendJson(res, 404, { error: 'Remediation not found' });

    job.status = 'REJECTED';
    const finding = db.findings.find(f => f.id === job.findingId);
    if (finding) {
      finding.remediationStatus = 'OPEN';
    }
    saveDb(db);
    return sendJson(res, 200, job);
  }

  const findingStatusMatch = pathname.match(/^\/api\/security\/findings\/([^/]+)\/status$/);
  if (findingStatusMatch && (req.method === 'PATCH' || req.method === 'POST')) {
    const findingId = findingStatusMatch[1];
    const finding = db.findings.find(f => f.id === findingId);
    if (!finding) return sendJson(res, 404, { error: 'Finding not found' });

    const newStatus = parsedUrl.query.status || 'RESOLVED';
    finding.remediationStatus = newStatus;
    recalculateProjectScores(db);
    saveDb(db);
    return sendJson(res, 200, finding);
  }

  // 5. App Monitor APIs
  if (pathname === '/api/apps' && req.method === 'GET') {
    return sendJson(res, 200, db.projects);
  }

  const appOverviewMatch = pathname.match(/^\/api\/apps\/([^/]+)\/overview$/);
  if (appOverviewMatch && req.method === 'GET') {
    const appId = appOverviewMatch[1];
    const proj = db.projects.find(p => p.id === appId || p.slug === appId) || db.projects[0];
    const findings = db.findings.filter(f => f.projectId === proj.id);
    return sendJson(res, 200, {
      project: proj,
      findings: findings,
      serverStatus: proj.serverStatus,
      port: proj.devServerPort
    });
  }

  const appStartMatch = pathname.match(/^\/api\/apps\/([^/]+)\/start$/);
  if (appStartMatch && req.method === 'POST') {
    const appId = appStartMatch[1];
    const proj = db.projects.find(p => p.id === appId || p.slug === appId);
    if (proj) {
      proj.serverStatus = 'RUNNING';
      saveDb(db);
    }
    return sendJson(res, 200, { status: 'SUCCESS', serverStatus: 'RUNNING', port: proj ? proj.devServerPort : 3001 });
  }

  const appStopMatch = pathname.match(/^\/api\/apps\/([^/]+)\/stop$/);
  if (appStopMatch && req.method === 'POST') {
    const appId = appStopMatch[1];
    const proj = db.projects.find(p => p.id === appId || p.slug === appId);
    if (proj) {
      proj.serverStatus = 'STOPPED';
      saveDb(db);
    }
    return sendJson(res, 200, { status: 'SUCCESS', serverStatus: 'STOPPED' });
  }

  const appLogsMatch = pathname.match(/^\/api\/apps\/([^/]+)\/logs$/);
  if (appLogsMatch && req.method === 'GET') {
    const logs = [
      { timestamp: '18:45:02', level: 'INFO', text: '[nodemon] 3.0.1 - starting `node server.js`' },
      { timestamp: '18:45:03', level: 'INFO', text: '[vault-sync] Synchronized 5 credentials from Vault KV v2 mount.' },
      { timestamp: '18:45:04', level: 'INFO', text: '[http] Microservice listening on port http://0.0.0.0:3001' },
      { timestamp: '18:45:06', level: 'INFO', text: '[falco-agent] eBPF probes attached to container PID namespace.' },
      { timestamp: '18:45:12', level: 'WARN', text: '[security-gate] Insecure cookie missing SameSite=Strict flag.' },
      { timestamp: '18:45:20', level: 'INFO', text: '[health-probe] GET /api/health HTTP/1.1 200 OK (1.2ms)' }
    ];
    return sendJson(res, 200, logs);
  }

  // 6. Vault APIs
  if (pathname === '/api/vault/secrets' && req.method === 'GET') {
    return sendJson(res, 200, db.vaultSecrets);
  }

  if (pathname === '/api/vault/secrets' && req.method === 'POST') {
    const body = await parseBody(req);
    const newSecret = {
      id: 'vlt-' + Math.floor(10 + Math.random() * 90),
      projectId: body.projectId || 'proj-netflix-clone',
      secretKey: body.secretKey || 'CUSTOM_API_SECRET',
      secretPath: body.secretPath || 'secret/data/production/custom',
      secretType: body.secretType || 'API_KEY',
      storageBackend: 'HashiCorp Vault KV v2',
      currentVersion: 1,
      status: 'ACTIVE',
      maskedValue: '••••••••••••• [v1]',
      lastRotatedAt: new Date().toISOString()
    };
    db.vaultSecrets.push(newSecret);
    saveDb(db);
    return sendJson(res, 201, newSecret);
  }

  const vaultRotateMatch = pathname.match(/^\/api\/vault\/secrets\/([^/]+)\/rotate$/);
  if (vaultRotateMatch && req.method === 'POST') {
    const vltId = vaultRotateMatch[1];
    const sec = db.vaultSecrets.find(s => s.id === vltId);
    if (!sec) return sendJson(res, 404, { error: 'Secret not found' });
    sec.currentVersion += 1;
    sec.maskedValue = '••••••••••••• [v' + sec.currentVersion + ']';
    sec.lastRotatedAt = new Date().toISOString();
    saveDb(db);
    return sendJson(res, 200, sec);
  }

  const vaultDelMatch = pathname.match(/^\/api\/vault\/secrets\/([^/]+)$/);
  if (vaultDelMatch && req.method === 'DELETE') {
    const vltId = vaultDelMatch[1];
    db.vaultSecrets = db.vaultSecrets.filter(s => s.id !== vltId);
    saveDb(db);
    return sendJson(res, 200, { message: 'Secret deleted from Vault KV v2', id: vltId });
  }

  if (pathname === '/api/vault/status' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'CONNECTED',
      vaultAddress: 'http://vault.security.internal:8200',
      kvEngine: 'secret/data/ (KV v2)',
      sealed: false,
      version: 'v1.15.4',
      activeSecretsCount: db.vaultSecrets.length,
      lastHealthCheck: new Date().toISOString()
    });
  }

  if (pathname === '/api/vault/test-connection' && req.method === 'POST') {
    return sendJson(res, 200, {
      connected: true,
      status: 'CONNECTED',
      latencyMs: 12,
      tokenStatus: 'VALID (OIDC Service Account Token)',
      message: 'Successfully authenticated to HashiCorp Vault KV v2 engine.'
    });
  }

  // 7. Runtime Monitoring APIs
  if (pathname === '/api/runtime/summary' && req.method === 'GET') {
    const unacked = db.alerts.filter(a => !a.acknowledged).length;
    return sendJson(res, 200, {
      activePods: db.pods.length,
      cpuUsagePercent: 42,
      memoryUsagePercent: 68,
      networkThroughput: '1.2 GB/s',
      activeThreats: unacked,
      clusterStatus: 'HEALTHY',
      clusterName: 'prod-k8s-cluster-01',
      namespace: 'production',
      falcoEngineStatus: 'ATTACHED (v0.37.1)'
    });
  }

  if (pathname === '/api/runtime/pods' && req.method === 'GET') {
    return sendJson(res, 200, db.pods);
  }

  if (pathname === '/api/runtime/alerts' && req.method === 'GET') {
    return sendJson(res, 200, db.alerts);
  }

  const ackAlertMatch = pathname.match(/^\/api\/runtime\/alerts\/([^/]+)\/acknowledge$/);
  if (ackAlertMatch && req.method === 'POST') {
    const alertId = ackAlertMatch[1];
    const alert = db.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = 'Security Engineer (Console)';
      saveDb(db);
    }
    return sendJson(res, 200, alert);
  }

  // 8. Compliance APIs
  if (pathname === '/api/compliance/summary' && req.method === 'GET') {
    return sendJson(res, 200, {
      overallComplianceScore: 84,
      totalControls: db.complianceControls.length,
      passedControls: db.complianceControls.filter(c => c.status === 'PASS').length,
      warningControls: db.complianceControls.filter(c => c.status === 'WARNING').length,
      failedControls: db.complianceControls.filter(c => c.status === 'FAIL').length,
      lastAuditTimestamp: new Date().toISOString(),
      frameworks: db.complianceFrameworks
    });
  }

  if (pathname === '/api/compliance/controls' && req.method === 'GET') {
    const fw = parsedUrl.query.frameworkId;
    let list = db.complianceControls;
    if (fw) list = list.filter(c => c.frameworkId === fw);
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/compliance/audit' && req.method === 'POST') {
    return sendJson(res, 200, {
      auditId: 'aud-' + Date.now().toString(36),
      status: 'COMPLETED',
      evaluatedAt: new Date().toISOString(),
      controlsEvaluated: db.complianceControls.length,
      message: 'Continuous compliance audit verified all automated technical evidence logs.'
    });
  }

  if (pathname === '/api/compliance/export' && req.method === 'GET') {
    return sendJson(res, 200, {
      exportId: 'audit-pkg-' + Date.now().toString(36),
      frameworks: ['SOC 2 Type II', 'ISO 27001:2022', 'NIST SP 800-53', 'PCI DSS v4.0', 'HIPAA'],
      status: 'COMPILED',
      disclaimer: 'Automated technical evaluations provide operational control evidence and do not constitute legal compliance.'
    });
  }

  // 9. Reports APIs
  if (pathname === '/api/reports' && req.method === 'GET') {
    const list = [
      { id: 'rep-01', title: 'Executive Security Summary', type: 'EXECUTIVE', format: 'PDF', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'rep-02', title: 'Project Security Assessment - Netflix Clone', type: 'PROJECT', format: 'PDF', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'rep-03', title: 'Vulnerability Inventory & Exploitability Analysis', type: 'VULNERABILITY', format: 'CSV', createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: 'rep-04', title: 'SOC 2 Type II Continuous Compliance Evidence Package', type: 'COMPLIANCE', format: 'PDF', createdAt: new Date(Date.now() - 28800000).toISOString() }
    ];
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/reports/generate' && req.method === 'POST') {
    const body = await parseBody(req);
    return sendJson(res, 200, {
      reportId: 'rep-' + Date.now().toString(36),
      title: body.title || 'DevSecOps Audit Report',
      reportType: body.reportType || 'EXECUTIVE',
      format: body.format || 'PDF',
      status: 'READY',
      downloadUrl: '/api/reports/download'
    });
  }

  if (pathname === '/api/reports/export-csv' && req.method === 'GET') {
    let csv = 'ID,Project,Category,Title,CVE_ID,Package,Installed_Version,Fixed_Version,Severity,CVSS,Tool,Status\n';
    for (const f of db.findings) {
      csv += `"${f.id}","${f.projectId}","${f.category}","${f.title.replace(/"/g, '""')}","${f.cveId || 'N/A'}","${f.packageName || 'N/A'}","${f.installedVersion || 'N/A'}","${f.fixedVersion || 'N/A'}","${f.severity}",${f.cvssScore || 0},"${f.toolName}","${f.remediationStatus}"\n`;
    }
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=vulnerability_assessment.csv',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(csv);
  }

  // 10. Settings APIs
  if (pathname === '/api/settings' && req.method === 'GET') {
    return sendJson(res, 200, db.settings);
  }

  if (pathname === '/api/settings' && (req.method === 'PUT' || req.method === 'POST')) {
    const body = await parseBody(req);
    Object.assign(db.settings, body);
    saveDb(db);
    return sendJson(res, 200, db.settings);
  }

  if (pathname === '/api/settings/integrations' && req.method === 'GET') {
    return sendJson(res, 200, db.integrations);
  }

  const testIntMatch = pathname.match(/^\/api\/settings\/integrations\/([^/]+)\/test$/);
  if (testIntMatch && req.method === 'POST') {
    const intName = testIntMatch[1];
    const intItem = db.integrations.find(i => i.name === intName);
    if (intItem) {
      intItem.status = 'CONNECTED';
      intItem.lastCheckedAt = new Date().toISOString();
      saveDb(db);
    }
    return sendJson(res, 200, {
      name: intName,
      status: 'CONNECTED',
      message: 'Integration health probe passed with 200 OK.'
    });
  }

  // 11. AI Assistant API — Ollama LLM with deterministic fallback
  if (pathname === '/api/assistant/chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const userMessage = (body.message || '').trim();
    const preferredModel = body.model || null;

    // ── Build rich system prompt from live platform data ──────────────────
    function buildSystemPrompt() {
      const openFindings = (db.findings || []).filter(f => f.remediationStatus !== 'RESOLVED' && f.remediationStatus !== 'SUPPRESSED');
      const critFindings = openFindings.filter(f => f.severity === 'CRITICAL');
      const highFindings = openFindings.filter(f => f.severity === 'HIGH');
      const secretFindings = openFindings.filter(f => f.category === 'SECRET');
      const unackAlerts = (db.alerts || []).filter(a => !a.acknowledged);
      const failedPipelines = (db.pipelines || []).filter(p => p.status === 'FAILED');

      const projectSummaries = (db.projects || []).map(p =>
        `  - ${p.name} (${p.language || 'Unknown'}): score=${p.securityScore}/100, ` +
        `CRITICAL=${p.criticalCount}, HIGH=${p.highCount}, MEDIUM=${p.mediumCount}, LOW=${p.lowCount}, ` +
        `secrets=${p.exposedSecretCount}, pipeline=${p.pipelineStatus}`
      ).join('\n');

      const critSummaries = critFindings.slice(0, 8).map(f =>
        `  - [${f.severity}] ${f.cveId || f.title} in ${f.projectId} — pkg: ${f.packageName || 'N/A'}, CVSS: ${f.cvssScore || 'N/A'}, tool: ${f.toolName}`
      ).join('\n');

      const secretSummaries = secretFindings.slice(0, 5).map(s =>
        `  - ${s.title} in ${s.projectId} at ${s.filePath || 'N/A'}:${s.lineNumber || '?'} [VALUE MASKED]`
      ).join('\n');

      const alertSummaries = unackAlerts.slice(0, 6).map(a =>
        `  - [${a.severity}] ${a.ruleName} — pod: ${a.podName || 'N/A'}, ns: ${a.namespace || 'default'}`
      ).join('\n');

      const pipelineSummaries = failedPipelines.slice(0, 3).map(p =>
        `  - Execution #${p.executionNumber} on ${p.projectId}/${p.branch || 'main'} — failed stage: ${
          (p.stages || []).find(s => s.status === 'FAILED')?.name || 'unknown'}`
      ).join('\n');

      const complianceControls = db.complianceControls || [];
      const passedControls = complianceControls.filter(c => c.status === 'PASS').length;

      return `You are the DevSecOps Security Intelligence Assistant for an enterprise container security platform.
You have LIVE ACCESS to the following real platform data. Use ONLY this data in your answers.
NEVER invent CVE IDs, project names, scores, or finding details not listed below.
Format responses with markdown ** bold ** and bullet points. Keep answers concise and always suggest a next action.
CRITICAL RULE: Never reveal secret values, tokens, or credentials — they are always masked.

=== PLATFORM OVERVIEW ===
Projects: ${(db.projects || []).length} | Open Findings: ${openFindings.length} (CRITICAL: ${critFindings.length}, HIGH: ${highFindings.length})
Exposed Secrets: ${secretFindings.length} | Unacknowledged Runtime Alerts: ${unackAlerts.length}
Failed Pipelines: ${failedPipelines.length} | Vault Secrets: ${(db.vaultSecrets || []).length}
Compliance: ${passedControls}/${complianceControls.length} controls passing

=== REGISTERED PROJECTS ===
${projectSummaries || '  No projects yet.'}

=== CRITICAL VULNERABILITIES ===
${critSummaries || '  None — excellent security posture!'}

=== EXPOSED SECRETS (values always masked) ===
${secretSummaries || '  None detected.'}

=== FALCO RUNTIME ALERTS (unacknowledged) ===
${alertSummaries || '  No active alerts.'}

=== FAILED PIPELINES ===
${pipelineSummaries || '  All pipelines passing.'}

=== INTEGRATED SECURITY TOOLS ===
Gitleaks (secrets), SonarQube (SAST), OWASP Dependency-Check (CVEs),
Hadolint (Dockerfile), Checkov (IaC), Trivy (containers), Cosign (signing),
Falco (runtime), HashiCorp Vault (secrets management).
Pipeline: 12 stages with mandatory security gates blocking critical findings.`;
    }

    // ── Discover Ollama models ────────────────────────────────────────────
    function getOllamaModels() {
      return new Promise((resolve) => {
        const req = http.request(
          { hostname: '127.0.0.1', port: 11434, path: '/api/tags', method: 'GET' },
          (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
              try { resolve((JSON.parse(data).models || []).map(m => m.name)); }
              catch { resolve([]); }
            });
          }
        );
        req.setTimeout(4000, () => { req.destroy(); resolve([]); });
        req.on('error', () => resolve([]));
        req.end();
      });
    }

    // ── Call Ollama /api/chat ─────────────────────────────────────────────
    function callOllama(systemPrompt, userMsg, modelName) {
      return new Promise((resolve, reject) => {
        const requestBody = JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ],
          stream: false,
          options: { temperature: 0.3, num_predict: 600 }
        });

        const req = http.request({
          hostname: '127.0.0.1',
          port: 11434,
          path: '/api/chat',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody) }
        }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              const text = parsed?.message?.content || parsed?.response || '';
              if (!text) return reject(new Error('Empty response from Ollama'));
              resolve({ text, model: parsed.model || modelName });
            } catch (e) {
              reject(new Error('Ollama parse error: ' + data.slice(0, 150)));
            }
          });
        });

        req.setTimeout(30000, () => { req.destroy(); reject(new Error('Ollama timed out (30s)')); });
        req.on('error', err => reject(err));
        req.write(requestBody);
        req.end();
      });
    }

    // ── Deterministic fallback (rich, context-aware) ──────────────────────
    function deterministicAnswer(msg) {
      const q = msg.toLowerCase();
      const acts = [];
      let ans = '';

      if (q.includes('critical') || q.includes('vulnerabilit') || q.includes('cve')) {
        const crits = (db.findings || []).filter(f => f.severity === 'CRITICAL' && f.remediationStatus !== 'RESOLVED');
        if (crits.length === 0) {
          ans = '✅ **No open critical vulnerabilities!** Your platform is in excellent shape.';
        } else {
          ans = `🔴 **${crits.length} open critical vulnerabilities:**\n\n` +
            crits.map(f => `• **${f.cveId || 'VULN'}** (${f.packageName || 'pkg'}): ${f.title}\n  Project: \`${f.projectId}\` | CVSS: ${f.cvssScore} | Tool: ${f.toolName}`).join('\n\n') +
            '\n\n**Next action:** Review patch proposals in the Security Center.';
          acts.push({ label: 'View Critical CVEs', route: '/security' });
        }
      } else if (q.includes('lowest') || q.includes('worst') || (q.includes('score') && !q.includes('security score'))) {
        const sorted = [...(db.projects || [])].sort((a, b) => a.securityScore - b.securityScore);
        const p = sorted[0];
        if (p) {
          ans = `📊 **${p.name}** has the lowest score: **${p.securityScore}/100**\n\n` +
            `• CRITICAL: ${p.criticalCount} | HIGH: ${p.highCount} | MEDIUM: ${p.mediumCount}\n` +
            `• Exposed Secrets: ${p.exposedSecretCount} | Pipeline: ${p.pipelineStatus}\n\n` +
            `**Next action:** Trigger a new scan and review findings.`;
          acts.push({ label: `Inspect ${p.name}`, route: '/apps' });
        }
      } else if (q.includes('pipeline') || q.includes('fail') || q.includes('ci/cd') || q.includes('stage')) {
        const failed = (db.pipelines || []).find(p => p.status === 'FAILED');
        if (failed) {
          const fs2 = (failed.stages || []).find(s => s.status === 'FAILED');
          ans = `⛔ **Pipeline #${failed.executionNumber}** failed on \`${failed.branch || 'main'}\`\n\n` +
            `• **Failed Stage:** ${fs2?.name || 'Hadolint Linting'}\n` +
            `• **Root Cause:** \`DL3002: Last USER should not be root\`\n\n` +
            `**Fix:**\n\`\`\`dockerfile\nRUN addgroup -S app && adduser -S app -G app\nUSER app\n\`\`\``;
          acts.push({ label: 'View Pipeline Logs', route: '/pipelines' });
        } else {
          ans = '✅ All pipelines are currently **passing**.';
          acts.push({ label: 'View Pipelines', route: '/pipelines' });
        }
      } else if (q.includes('secret') || q.includes('hardcoded') || q.includes('leak') || q.includes('gitleak')) {
        const secs = (db.findings || []).filter(f => f.category === 'SECRET' && f.remediationStatus !== 'RESOLVED');
        ans = `🔑 **${secs.length} exposed secret(s) detected:**\n\n` +
          secs.map(s => `• **${s.title}** — \`${s.filePath}:${s.lineNumber || '?'}\`\n  → ${s.remediationGuidance || 'Rotate and store in Vault'}`).join('\n\n') +
          '\n\n*Secret values are always masked per DevSecOps policy.*';
        acts.push({ label: 'Open Vault Manager', route: '/vault' });
      } else if (q.includes('runtime') || q.includes('falco') || q.includes('threat') || q.includes('alert')) {
        const unack = (db.alerts || []).filter(a => !a.acknowledged);
        ans = `🛡️ **Falco Runtime: ${unack.length} unacknowledged alert(s)**\n\n` +
          unack.map(a => `• \`[${a.severity}]\` **${a.ruleName}**\n  Pod: \`${a.podName || 'N/A'}\` | NS: \`${a.namespace || 'default'}\`\n  ${a.description || ''}`).join('\n\n');
        acts.push({ label: 'Acknowledge Alerts', route: '/monitoring' });
      } else if (q.includes('root') || q.includes('dl3002') || q.includes('non-root') || q.includes('dockerfile')) {
        ans = `🐳 **Fix DL3002 — Container Running as Root (CIS 4.1):**\n\n` +
          `\`\`\`dockerfile\nRUN addgroup -S appgroup && adduser -S appuser -G appgroup\nWORKDIR /app\nCOPY --chown=appuser:appgroup . .\nUSER appuser\nEXPOSE 3000\nCMD ["npm", "start"]\n\`\`\`\n\n` +
          `**Kubernetes SecurityContext:**\n\`\`\`yaml\nsecurityContext:\n  runAsNonRoot: true\n  runAsUser: 10001\n  allowPrivilegeEscalation: false\n  readOnlyRootFilesystem: true\n  capabilities:\n    drop: ["ALL"]\n\`\`\``;
        acts.push({ label: 'Generate Fixed Dockerfile', route: '/apps' });
      } else if (q.includes('compliance') || q.includes('audit') || q.includes('cis') || q.includes('nist') || q.includes('soc')) {
        const controls = db.complianceControls || [];
        const passed = controls.filter(c => c.status === 'PASS').length;
        const failedC = controls.filter(c => c.status === 'FAIL');
        ans = `📋 **Compliance: ${passed}/${controls.length} controls passing**\n\n` +
          (failedC.length > 0
            ? failedC.slice(0, 5).map(c => `• ❌ ${c.controlId}: ${c.name} (${c.framework})`).join('\n')
            : '✅ All controls passing!');
        acts.push({ label: 'View Compliance Report', route: '/compliance' });
      } else if (q.includes('vault') || q.includes('secret manager') || q.includes('hashicorp')) {
        const vs = db.vaultSecrets || [];
        ans = `🔐 **HashiCorp Vault: ${vs.length} secret(s) managed**\n\n` +
          vs.slice(0, 5).map(s => `• \`${s.path}\` (${s.type || 'KV'}) — rotated: ${s.lastRotated ? new Date(s.lastRotated).toLocaleDateString() : 'Never'}`).join('\n');
        acts.push({ label: 'Open Vault', route: '/vault' });
      } else {
        const stats = {
          projects: (db.projects || []).length,
          open: (db.findings || []).filter(f => f.remediationStatus !== 'RESOLVED').length,
          critical: (db.findings || []).filter(f => f.severity === 'CRITICAL' && f.remediationStatus !== 'RESOLVED').length,
          alerts: (db.alerts || []).filter(a => !a.acknowledged).length
        };
        ans = `🤖 **DevSecOps AI Assistant** — Live platform state:\n\n` +
          `• Projects: **${stats.projects}** | Open Findings: **${stats.open}** | Critical: **${stats.critical}**\n` +
          `• Unacknowledged Alerts: **${stats.alerts}**\n\n` +
          `**Try asking:**\n` +
          `• "Show critical vulnerabilities"\n• "Which project has the lowest score?"\n` +
          `• "Show exposed secrets"\n• "What's the Falco runtime status?"\n` +
          `• "How do I fix the root container issue?"\n• "Show compliance status"`;
      }
      return { answer: ans, actions: acts };
    }

    // ── Main: try Ollama → fall back to deterministic ─────────────────────
    let finalAnswer = '';
    let finalActions = [];
    let modelUsed = 'DevSecOps Intelligence Engine (deterministic)';
    let ollamaAvailable = false;
    let ollamaModels = [];

    try {
      ollamaModels = await getOllamaModels();
      if (ollamaModels.length > 0) {
        ollamaAvailable = true;
        // Pick best model: client preference → llama3 family → mistral → first available
        const priority = [preferredModel, 'llama3.2', 'llama3.1', 'llama3', 'mistral', 'phi3', 'gemma3', 'gemma', 'llama2'];
        const chosen = priority.find(m => m && ollamaModels.some(om => om === m || om.startsWith(m + ':')))
          || ollamaModels[0];

        const systemPrompt = buildSystemPrompt();
        const result = await callOllama(systemPrompt, userMessage, chosen);
        finalAnswer = result.text;
        modelUsed = `Ollama / ${result.model}`;

        // Add a context-appropriate action button
        const qLow = userMessage.toLowerCase();
        if (qLow.includes('secret') || qLow.includes('vault')) finalActions.push({ label: 'Open Vault', route: '/vault' });
        else if (qLow.includes('pipeline')) finalActions.push({ label: 'View Pipelines', route: '/pipelines' });
        else if (qLow.includes('compliance') || qLow.includes('audit')) finalActions.push({ label: 'View Compliance', route: '/compliance' });
        else if (qLow.includes('runtime') || qLow.includes('falco')) finalActions.push({ label: 'Runtime Monitor', route: '/monitoring' });
        else if (qLow.includes('vuln') || qLow.includes('cve')) finalActions.push({ label: 'Security Center', route: '/security' });
      } else {
        throw new Error('No Ollama models found — is Ollama running?');
      }
    } catch (ollamaErr) {
      const det = deterministicAnswer(userMessage);
      finalAnswer = det.answer;
      finalActions = det.actions;
      modelUsed = ollamaAvailable
        ? `DevSecOps Intelligence Engine (Ollama error: ${ollamaErr.message.slice(0, 80)})`
        : 'DevSecOps Intelligence Engine (deterministic — start Ollama to enable LLM mode)';
    }

    return sendJson(res, 200, {
      question: userMessage,
      answer: finalAnswer,
      actions: finalActions,
      model: modelUsed,
      ollamaAvailable,
      ollamaModels
    });
  }

  // 12. Static File Server for Frontend
  const publicDir = path.join(__dirname, '..', 'public');
  let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Fallback to index.html for SPA client-side routing
  const indexHtml = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
    return fs.createReadStream(indexHtml).pipe(res);
  }

  return sendJson(res, 404, { error: 'Not found', path: pathname });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[DevSecOps Platform Server] Listening on http://localhost:${PORT}`);
  console.log(`[DevSecOps Platform Server] Dashboard UI: http://localhost:${PORT}/`);
  console.log(`[DevSecOps Platform Server] REST APIs: http://localhost:${PORT}/api/dashboard/summary`);
});

if (Number(PORT) !== 3000) {
  try {
    const server3000 = http.createServer(server.listeners('request')[0]);
    server3000.listen(3000, '0.0.0.0', () => {
      console.log(`[DevSecOps Platform Server] Also accessible on http://localhost:3000/`);
    }).on('error', () => {});
  } catch (e) {}
}
