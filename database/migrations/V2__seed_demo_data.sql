-- V2__seed_demo_data.sql
-- Seed demo data for DevSecOps Platform: Netflix Clone, Netflix Web, Pake App, etc.

-- Roles
INSERT INTO roles (id, name, description) VALUES
('ROLE_ADMIN', 'Administrator', 'Full system control, policy overrides, user management'),
('ROLE_SECURITY_ENGINEER', 'Security Engineer', 'Vulnerability remediation, scan execution, policy config'),
('ROLE_DEVELOPER', 'Developer', 'Project access, pipeline execution, patch viewing'),
('ROLE_AUDITOR', 'Compliance Auditor', 'Audit evidence inspection, compliance report exports'),
('ROLE_VIEWER', 'Viewer', 'Read-only dashboard inspection')
ON CONFLICT (id) DO NOTHING;

-- Default User (admin / DevSecOpsAdmin2026!)
INSERT INTO users (id, username, email, password_hash, full_name, department) VALUES
('usr-admin-01', 'admin', 'secops-admin@enterprise.internal', '$2a$12$e80yMvCj2u8Y9k6T9Mv4ge2sOq8G8PzV7qL5Y.M9w6bN4Y1y0qZ1m', 'DevSecOps Admin', 'Cloud Security Engineering')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
('usr-admin-01', 'ROLE_ADMIN')
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (
    id, name, slug, repository_url, default_branch, workspace_path, description,
    language, framework, security_score, critical_count, high_count, medium_count, low_count,
    exposed_secret_count, pipeline_status, project_status, server_status, dev_server_port,
    dependency_count, file_count, has_dockerfile, has_k8s_manifest, has_iac, last_scanned_at
) VALUES
(
    'proj-netflix-clone',
    'Netflix Clone',
    'netflix-clone',
    'https://github.com/enterprise-devsecops/netflix-clone.git',
    'main',
    '/workspaces/netflix-clone',
    'Full-featured microservices video streaming front/backend with React and Node.js',
    'TypeScript',
    'React / Node.js',
    78, 1, 3, 5, 8, 1,
    'PASSED', 'ACTIVE', 'RUNNING', 3001,
    142, 385, TRUE, TRUE, TRUE,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'proj-netflix-web',
    'Netflix Web',
    'netflix-web',
    'https://github.com/enterprise-devsecops/netflix-web.git',
    'master',
    '/workspaces/netflix-web',
    'Customer-facing catalog UI and high-throughput video delivery web service',
    'JavaScript',
    'Next.js / Express',
    64, 2, 5, 8, 12, 1,
    'FAILED', 'ACTIVE', 'STOPPED', 3002,
    98, 240, TRUE, TRUE, FALSE,
    CURRENT_TIMESTAMP - INTERVAL '5 hours'
),
(
    'proj-pake-app',
    'Pake App',
    'pake-app',
    'https://github.com/enterprise-devsecops/pake-desktop.git',
    'main',
    '/workspaces/pake-app',
    'Lightweight containerized web-to-desktop wrapper built with Rust and WebKit runtime',
    'Rust / TS',
    'Tauri / Rust',
    92, 0, 1, 2, 4, 0,
    'PASSED', 'ACTIVE', 'STOPPED', 8085,
    64, 118, TRUE, TRUE, TRUE,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Security Findings (CVEs, Secrets, Docker, SAST)
INSERT INTO security_findings (
    id, project_id, category, title, cve_id, package_name, installed_version, fixed_version,
    file_path, line_number, severity, cvss_score, exploitability, tool_name, description,
    remediation_guidance, remediation_status, first_detected_at, last_detected_at
) VALUES
(
    'find-cve-001',
    'proj-netflix-clone',
    'CVE',
    'Remote Code Execution in jsonwebtoken verification',
    'CVE-2022-23529',
    'jsonwebtoken',
    '8.5.1',
    '9.0.0',
    'package.json',
    24,
    'CRITICAL',
    9.8,
    'FUNCTIONAL',
    'OWASP Dependency-Check',
    'jsonwebtoken versions before 9.0.0 are vulnerable to remote code execution due to insecure secret or public key validation via crafted key objects.',
    'Upgrade jsonwebtoken to version 9.0.0 or higher. Review jwt.verify calls to pass string or Buffer secrets.',
    'PATCH_PROPOSED',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'find-sec-002',
    'proj-netflix-clone',
    'SECRET',
    'Exposed AWS Secret Access Key in client configuration',
    NULL,
    NULL,
    NULL,
    NULL,
    'src/config/aws-client.ts',
    42,
    'CRITICAL',
    9.5,
    'HIGH',
    'Gitleaks',
    'Hardcoded AWS Secret Access Key detected in repository source code history.',
    'Immediately revoke secret key in AWS IAM. Use HashiCorp Vault or AWS Secrets Manager dynamic credential injection.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'find-cve-003',
    'proj-netflix-web',
    'CVE',
    'Denial of Service via Prototype Pollution in lodash',
    'CVE-2023-45853',
    'lodash',
    '4.17.20',
    '4.17.21',
    'package.json',
    18,
    'HIGH',
    7.5,
    'PROOF_OF_CONCEPT',
    'Trivy',
    'Prototype pollution in lodash allows remote attackers to cause denial of service or manipulate application logic.',
    'Update lodash to 4.17.21 in package.json and lockfile.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '5 hours'
),
(
    'find-doc-004',
    'proj-netflix-web',
    'DOCKER',
    'Dockerfile runs container process as root user',
    NULL,
    NULL,
    NULL,
    NULL,
    'Dockerfile',
    38,
    'HIGH',
    7.8,
    'FUNCTIONAL',
    'Hadolint',
    'Dockerfile does not specify a non-root USER instruction. Containers running as root violate the principle of least privilege.',
    'Add non-root user creation: `RUN addgroup -S appgroup && adduser -S appuser -G appgroup` and switch with `USER appuser`.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '5 hours'
),
(
    'find-sast-005',
    'proj-netflix-web',
    'SAST',
    'Unsanitized User Input in DangerouslySetInnerHTML',
    NULL,
    NULL,
    NULL,
    NULL,
    'src/components/VideoPlayer.tsx',
    89,
    'HIGH',
    8.2,
    'FUNCTIONAL',
    'SonarQube',
    'Potential Cross-Site Scripting (XSS) via unescaped string injection into dangerouslySetInnerHTML.',
    'Use DOMPurify.sanitize() or native JSX text escaping rather than direct HTML injection.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '5 hours'
),
(
    'find-iac-006',
    'proj-netflix-clone',
    'IAC',
    'Kubernetes Pod Security Context missing readOnlyRootFilesystem',
    NULL,
    NULL,
    NULL,
    NULL,
    'k8s/deployment.yaml',
    31,
    'MEDIUM',
    5.5,
    'UNPROVEN',
    'Checkov',
    'Pod specification does not enforce readOnlyRootFilesystem=true, permitting malicious tampering of container binaries.',
    'Configure securityContext.readOnlyRootFilesystem: true and mount an emptyDir volume for ephemeral cache.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Secret Detection Records
INSERT INTO secret_detection_records (
    id, project_id, finding_id, secret_type, masked_value, file_path, line_number, commit_hash, author, entropy, is_revoked, remediation_status
) VALUES
(
    'sec-rec-01',
    'proj-netflix-clone',
    'find-sec-002',
    'AWS_KEY',
    'AKIA••••••••••••4J29',
    'src/config/aws-client.ts',
    42,
    'a9f81d4b2e10',
    'dev-lead@enterprise.internal',
    4.82,
    FALSE,
    'OPEN'
)
ON CONFLICT (id) DO NOTHING;

-- Remediation Job for CVE-2022-23529
INSERT INTO remediation_jobs (
    id, project_id, finding_id, package_name, previous_version, proposed_version,
    target_branch, remediation_branch, diff_content, status, compatibility_warning,
    test_run_status, github_pr_number, github_pr_url, remediation_log, created_by
) VALUES
(
    'rem-job-001',
    'proj-netflix-clone',
    'find-cve-001',
    'jsonwebtoken',
    '8.5.1',
    '9.0.0',
    'main',
    'remediation/cve-2022-23529-jsonwebtoken-9.0.0',
    '--- a/package.json
+++ b/package.json
@@ -24,3 +24,3 @@
-    "jsonwebtoken": "^8.5.1",
+    "jsonwebtoken": "^9.0.0",
@@ -48,2 +48,2 @@
     "react": "^18.2.0",
     "react-dom": "^18.2.0"',
    'PROPOSED',
    'Major version upgrade (8.x -> 9.x): verify jwt.verify signature parameters for strict string/Buffer secret constraints.',
    'PASSED (Unit: 42/42 passed)',
    14,
    'https://github.com/enterprise-devsecops/netflix-clone/pull/14',
    '[REMEDIATION AUDIT]
Branch created: remediation/cve-2022-23529-jsonwebtoken-9.0.0
Dependency updated: jsonwebtoken 8.5.1 -> 9.0.0
Automated test suite triggered: 42 tests passed
OWASP Dependency-Check verification: CVE-2022-23529 CLEARED
Status: Ready for engineer approval and automated merge.',
    'DevSecOps Automated Agent'
)
ON CONFLICT (id) DO NOTHING;

-- Pipeline Executions (12 Stages)
INSERT INTO pipeline_executions (
    id, project_id, execution_number, branch, commit_hash, commit_message,
    triggered_by, status, duration_seconds, security_gate_passed, blocked_reason, started_at, ended_at
) VALUES
(
    'pipe-exec-142',
    'proj-netflix-clone',
    142,
    'main',
    'c7d81ef',
    'feat: optimize video streaming chunk caching with Redis',
    'GitHub Webhook (push)',
    'PASSED',
    215,
    TRUE,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 hour 56 minutes'
),
(
    'pipe-exec-141',
    'proj-netflix-web',
    141,
    'master',
    'b3a980c',
    'chore: update auth middleware and session persistence',
    'Jenkins Scheduler',
    'FAILED',
    148,
    FALSE,
    'MANDATORY GATE FAILURE: Hadolint detected container running as root user (DL3002). Cosign image signature blocked.',
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    CURRENT_TIMESTAMP - INTERVAL '4 hours 57 minutes'
),
(
    'pipe-exec-140',
    'proj-pake-app',
    140,
    'main',
    'f192b0e',
    'fix: improve IPC bridge security boundaries in desktop runtime',
    'akshayvangari',
    'PASSED',
    182,
    TRUE,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '23 hours 57 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- 12 Stages for Execution #142 (PASSED)
INSERT INTO pipeline_stages (id, execution_id, stage_order, name, tool_name, status, duration_seconds, is_gate, error_message, started_at, ended_at) VALUES
('stg-142-01', 'pipe-exec-142', 1, 'Git Clone & Vault Sync', 'Vault KV v2', 'PASSED', 12, FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '120 minutes', CURRENT_TIMESTAMP - INTERVAL '119 minutes'),
('stg-142-02', 'pipe-exec-142', 2, 'Secret Detection', 'Gitleaks v8.18', 'PASSED', 14, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '119 minutes', CURRENT_TIMESTAMP - INTERVAL '118 minutes'),
('stg-142-03', 'pipe-exec-142', 3, 'Static Code Analysis', 'SonarQube 10.4', 'PASSED', 28, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '118 minutes', CURRENT_TIMESTAMP - INTERVAL '117 minutes'),
('stg-142-04', 'pipe-exec-142', 4, 'Dependency Vulnerability Scan', 'OWASP Dependency-Check', 'PASSED', 35, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '117 minutes', CURRENT_TIMESTAMP - INTERVAL '116 minutes'),
('stg-142-05', 'pipe-exec-142', 5, 'Dockerfile Linting', 'Hadolint v2.12', 'PASSED', 10, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '116 minutes', CURRENT_TIMESTAMP - INTERVAL '115 minutes'),
('stg-142-06', 'pipe-exec-142', 6, 'Infrastructure Security', 'Checkov v3.2', 'PASSED', 18, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '115 minutes', CURRENT_TIMESTAMP - INTERVAL '114 minutes'),
('stg-142-07', 'pipe-exec-142', 7, 'Container Build', 'Docker Buildx', 'PASSED', 42, FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '114 minutes', CURRENT_TIMESTAMP - INTERVAL '113 minutes'),
('stg-142-08', 'pipe-exec-142', 8, 'Container Image Scan', 'Trivy v0.50', 'PASSED', 22, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '113 minutes', CURRENT_TIMESTAMP - INTERVAL '112 minutes'),
('stg-142-09', 'pipe-exec-142', 9, 'Container Image Signing', 'Cosign v2.2', 'PASSED', 8, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '112 minutes', CURRENT_TIMESTAMP - INTERVAL '111 minutes'),
('stg-142-10', 'pipe-exec-142', 10, 'Kubernetes Manifest Validation', 'kubeconform', 'PASSED', 9, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '111 minutes', CURRENT_TIMESTAMP - INTERVAL '110 minutes'),
('stg-142-11', 'pipe-exec-142', 11, 'Deployment', 'Helm / kubectl', 'PASSED', 11, FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '110 minutes', CURRENT_TIMESTAMP - INTERVAL '109 minutes'),
('stg-142-12', 'pipe-exec-142', 12, 'Post-Deployment Verification', 'Falco / Health Probe', 'PASSED', 6, FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '109 minutes', CURRENT_TIMESTAMP - INTERVAL '108 minutes')
ON CONFLICT (id) DO NOTHING;

-- Pipeline Stages for Execution #141 (FAILED at Dockerfile Linting Gate)
INSERT INTO pipeline_stages (id, execution_id, stage_order, name, tool_name, status, duration_seconds, is_gate, error_message, started_at, ended_at) VALUES
('stg-141-01', 'pipe-exec-141', 1, 'Git Clone & Vault Sync', 'Vault KV v2', 'PASSED', 14, FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '300 minutes', CURRENT_TIMESTAMP - INTERVAL '299 minutes'),
('stg-141-02', 'pipe-exec-141', 2, 'Secret Detection', 'Gitleaks v8.18', 'PASSED', 16, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '299 minutes', CURRENT_TIMESTAMP - INTERVAL '298 minutes'),
('stg-141-03', 'pipe-exec-141', 3, 'Static Code Analysis', 'SonarQube 10.4', 'PASSED', 32, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '298 minutes', CURRENT_TIMESTAMP - INTERVAL '297 minutes'),
('stg-141-04', 'pipe-exec-141', 4, 'Dependency Vulnerability Scan', 'OWASP Dependency-Check', 'PASSED', 41, TRUE, NULL, CURRENT_TIMESTAMP - INTERVAL '297 minutes', CURRENT_TIMESTAMP - INTERVAL '296 minutes'),
('stg-141-05', 'pipe-exec-141', 5, 'Dockerfile Linting', 'Hadolint v2.12', 'FAILED', 12, TRUE, 'DL3002: Last USER should not be root. Container must run with non-root UID.', CURRENT_TIMESTAMP - INTERVAL '296 minutes', CURRENT_TIMESTAMP - INTERVAL '295 minutes'),
('stg-141-06', 'pipe-exec-141', 6, 'Infrastructure Security', 'Checkov v3.2', 'SKIPPED', 0, TRUE, NULL, NULL, NULL),
('stg-141-07', 'pipe-exec-141', 7, 'Container Build', 'Docker Buildx', 'SKIPPED', 0, FALSE, NULL, NULL, NULL),
('stg-141-08', 'pipe-exec-141', 8, 'Container Image Scan', 'Trivy v0.50', 'SKIPPED', 0, TRUE, NULL, NULL, NULL),
('stg-141-09', 'pipe-exec-141', 9, 'Container Image Signing', 'Cosign v2.2', 'SKIPPED', 0, TRUE, NULL, NULL, NULL),
('stg-141-10', 'pipe-exec-141', 10, 'Kubernetes Manifest Validation', 'kubeconform', 'SKIPPED', 0, TRUE, NULL, NULL, NULL),
('stg-141-11', 'pipe-exec-141', 11, 'Deployment', 'Helm / kubectl', 'SKIPPED', 0, FALSE, NULL, NULL, NULL),
('stg-141-12', 'pipe-exec-141', 12, 'Post-Deployment Verification', 'Falco / Health Probe', 'SKIPPED', 0, FALSE, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- HashiCorp Vault Secrets Metadata
INSERT INTO vault_secret_metadata (
    id, project_id, secret_key, secret_path, secret_type, storage_backend, current_version, status, masked_value, last_rotated_at
) VALUES
('vlt-01', 'proj-netflix-clone', 'POSTGRES_DB_PASSWORD', 'secret/data/production/netflix-clone/db', 'DATABASE', 'HashiCorp Vault KV v2', 3, 'ACTIVE', '••••••••••••• [v3]', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('vlt-02', 'proj-netflix-clone', 'JWT_HMAC_SIGNING_KEY', 'secret/data/production/netflix-clone/jwt', 'API_KEY', 'HashiCorp Vault KV v2', 2, 'ACTIVE', '••••••••••••• [v2]', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('vlt-03', 'proj-netflix-web', 'STRIPE_LIVE_API_KEY', 'secret/data/production/netflix-web/payments', 'API_KEY', 'HashiCorp Vault KV v2', 1, 'ACTIVE', 'sk_live_••••••••••••', CURRENT_TIMESTAMP - INTERVAL '28 days'),
('vlt-04', 'proj-netflix-web', 'TLS_WILDCARD_CERT_KEY', 'secret/data/production/netflix-web/certs', 'CERTIFICATE', 'HashiCorp Vault KV v2', 2, 'ACTIVE', '••••••••••••• [RSA 4096]', CURRENT_TIMESTAMP - INTERVAL '60 days'),
('vlt-05', 'proj-pake-app', 'GITHUB_RELEASE_OAUTH_TOKEN', 'secret/data/production/pake/github', 'CLOUD_CREDENTIAL', 'HashiCorp Vault KV v2', 1, 'ACTIVE', 'token_••••••••••••••••', CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Runtime Threat Detection (Falco Alerts)
INSERT INTO runtime_alerts (
    id, rule_name, severity, pod_name, container_name, namespace, cluster_name,
    description, event_metadata, acknowledged, timestamp
) VALUES
(
    'flc-alert-001',
    'Terminal shell in container',
    'CRITICAL',
    'netflix-clone-deploy-7789f-8x2d9',
    'netflix-clone-backend',
    'production',
    'prod-k8s-cluster-01',
    'A interactive shell (sh/bash) was spawned inside running container by user root (UID=0, PID=1984).',
    '{"proc_name": "bash", "parent_proc": "containerd-shim", "user": "root", "image": "docker.enterprise.internal/netflix-clone:v2.4.1", "terminal": "pts/0"}'::jsonb,
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '35 minutes'
),
(
    'flc-alert-002',
    'Read sensitive file untrusted (/etc/shadow)',
    'HIGH',
    'netflix-web-core-66d49-4k9pl',
    'netflix-web-node',
    'production',
    'prod-k8s-cluster-01',
    'Unauthorized read operation performed on /etc/shadow file after initial startup sequence completed.',
    '{"proc_name": "node", "fd_name": "/etc/shadow", "user": "node", "image": "docker.enterprise.internal/netflix-web:v1.9.0"}'::jsonb,
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'flc-alert-003',
    'Unexpected outbound connection to external IP',
    'WARNING',
    'pake-backend-9df21-72zxa',
    'pake-rust-worker',
    'production',
    'prod-k8s-cluster-01',
    'Pod initiated an outbound TCP connection to unlisted external IP 185.220.101.5:443 not in egress policy.',
    '{"dest_ip": "185.220.101.5", "dest_port": 443, "proto": "tcp", "proc_name": "pake-worker"}'::jsonb,
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '8 hours'
),
(
    'flc-alert-004',
    'Container run with elevated Linux capabilities',
    'HIGH',
    'netflix-web-core-66d49-4k9pl',
    'netflix-web-node',
    'production',
    'prod-k8s-cluster-01',
    'Detected container executed with SYS_PTRACE capability, violating PodSecurityStandards restricted profile.',
    '{"capability": "SYS_PTRACE", "user": "root"}'::jsonb,
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Kubernetes Pods
INSERT INTO kubernetes_pods (
    id, pod_name, namespace, app_label, status, image, restarts, ready_replicas, cpu_cores, memory_mb, security_context_compliant
) VALUES
('pod-01', 'netflix-clone-deploy-7789f-8x2d9', 'production', 'netflix-clone', 'Running', 'docker.enterprise.internal/netflix-clone:v2.4.1', 0, '1/1', '0.24 cores', '312 MB', TRUE),
('pod-02', 'netflix-clone-deploy-7789f-1l4aa', 'production', 'netflix-clone', 'Running', 'docker.enterprise.internal/netflix-clone:v2.4.1', 0, '1/1', '0.19 cores', '298 MB', TRUE),
('pod-03', 'netflix-web-core-66d49-4k9pl', 'production', 'netflix-web', 'CrashLoopBackOff', 'docker.enterprise.internal/netflix-web:v1.9.0', 4, '0/1', '0.45 cores', '512 MB', FALSE),
('pod-04', 'netflix-web-core-66d49-9j3bx', 'production', 'netflix-web', 'Running', 'docker.enterprise.internal/netflix-web:v1.9.0', 1, '1/1', '0.38 cores', '480 MB', FALSE),
('pod-05', 'pake-backend-9df21-72zxa', 'production', 'pake-app', 'Running', 'docker.enterprise.internal/pake:v1.0.4', 0, '1/1', '0.08 cores', '124 MB', TRUE),
('pod-06', 'falco-daemonset-worker-k882a', 'falco-system', 'falco', 'Running', 'falcosecurity/falco:0.37.1', 0, '1/1', '0.12 cores', '194 MB', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Compliance Frameworks
INSERT INTO compliance_frameworks (id, name, version, description, compliance_score, total_controls, passed_controls, warning_controls, failed_controls) VALUES
('soc2', 'SOC 2 Type II', '2022 Trust Services Criteria', 'Security, Availability, Processing Integrity, and Confidentiality evaluation', 84, 18, 15, 2, 1),
('iso27001', 'ISO/IEC 27001:2022', 'Annex A Controls', 'International standard for information security management systems (ISMS)', 88, 22, 19, 2, 1),
('nist80053', 'NIST SP 800-53', 'Rev. 5 Security Controls', 'Security and Privacy Controls for Federal Information Systems and Organizations', 79, 25, 20, 3, 2),
('pci-dss', 'PCI DSS v4.0', 'Payment Card Industry', 'Technical and operational requirements for entities handling credit card transactions', 91, 16, 14, 2, 0),
('hipaa', 'HIPAA Security Rule', '45 CFR Part 160 & 164', 'Security standards for the protection of electronic protected health information', 86, 14, 12, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Compliance Controls with Automated Technical Evidence
INSERT INTO compliance_controls (
    id, framework_id, control_code, control_name, requirements, category, severity,
    status, technical_evidence, linked_project, remediation_guidance
) VALUES
(
    'ctrl-soc2-01',
    'soc2',
    'CC6.1',
    'Logical Access and Credentials Protection',
    'The entity implements logical access security software, infrastructure, and architectures over protected assets.',
    'Access Control',
    'CRITICAL',
    'WARNING',
    '[AUTOMATED EVIDENCE LOG - Gitleaks Engine]
Scan ID: scn-2026-10-09-001
Result: 1 exposed AWS key detected in netflix-clone repo.
Vault Status: Vault KV v2 sync verified for 5 active credentials.
Evaluation: Control flagged for warning due to lingering secret in source tree.',
    'Netflix Clone',
    'Revoke exposed AWS secret key in AWS console and confirm deletion from git history using git-filter-repo.'
),
(
    'ctrl-soc2-02',
    'soc2',
    'CC6.6',
    'Vulnerability Management Before Deployment',
    'Boundary protection, container scanning, and dependency analysis are implemented prior to production release.',
    'Secure SDLC',
    'CRITICAL',
    'PASS',
    '[AUTOMATED EVIDENCE LOG - Trivy & OWASP DC]
Pipeline #142 Gate: PASSED
Trivy Image Scan: 0 Critical vulnerabilities in production container image.
OWASP Dependency-Check: High/Critical gate threshold passed.
Cosign Signature: Verified sha256:4a81cf26...',
    'Netflix Clone',
    'Maintain automated gate threshold in Jenkinsfile and Trivy security gate settings.'
),
(
    'ctrl-soc2-03',
    'soc2',
    'CC6.8',
    'Runtime Intrusion Detection & Threat Prevention',
    'The entity implements controls to prevent or detect unauthorized code execution or container tampering at runtime.',
    'Runtime Security',
    'HIGH',
    'FAIL',
    '[AUTOMATED EVIDENCE LOG - Falco DaemonSet]
Rule: Terminal shell in container
Severity: CRITICAL
Pod: netflix-clone-deploy-7789f-8x2d9
Container: netflix-clone-backend
Active alert acknowledged: false. Control marked FAIL.',
    'Netflix Clone',
    'Investigate container shell access immediately. Restrict kubectl exec permissions in RBAC role definitions.'
),
(
    'ctrl-iso-01',
    'iso27001',
    'A.8.28',
    'Secure Coding & Application Security Testing',
    'Secure coding principles must be applied to software development. Static analysis and peer reviews required.',
    'Development Security',
    'HIGH',
    'PASS',
    '[AUTOMATED EVIDENCE LOG - SonarQube & Checkov]
SonarQube Quality Gate: PASSED for netflix-clone (Reliability: A, Security: A).
Code Coverage: 84.2%.
Checkov IaC rules: 28 evaluated, 27 passed, 1 medium warning.',
    'Netflix Clone',
    'Address readOnlyRootFilesystem warning in k8s deployment manifest.'
),
(
    'ctrl-iso-02',
    'iso27001',
    'A.8.9',
    'Configuration Management & Privilege Restriction',
    'Configurations including containers, operating systems, and services shall be securely managed to prevent root misuse.',
    'System Hardening',
    'CRITICAL',
    'FAIL',
    '[AUTOMATED EVIDENCE LOG - Hadolint Engine]
Project: netflix-web
Dockerfile Check: DL3002 Violation. Container image builds and executes with UID 0 (root).
Pipeline Execution #141 was BLOCKED by Mandatory Gate.',
    'Netflix Web',
    'Update Dockerfile with non-root user directive before container entrypoint.'
),
(
    'ctrl-nist-01',
    'nist80053',
    'AC-2',
    'Account Management and Least Privilege',
    'Manage information system accounts and enforce least privilege in containerized execution contexts.',
    'Access Control',
    'HIGH',
    'WARNING',
    '[AUTOMATED EVIDENCE LOG - Kubernetes API Audit]
Cluster: prod-k8s-cluster-01
Pod: netflix-web-core-66d49-4k9pl running with excessive capabilities (SYS_PTRACE).
Falco Rule Triggered: Container run with elevated Linux capabilities.',
    'Netflix Web',
    'Drop all default capabilities and remove SYS_PTRACE in securityContext.capabilities.drop: [ALL].'
),
(
    'ctrl-pci-01',
    'pci-dss',
    'Req 6.4.2',
    'Automated Technical Attack Detection in Web Applications',
    'Public-facing web applications are protected against known attacks with automated runtime monitoring and DAST.',
    'Payment Security',
    'CRITICAL',
    'PASS',
    '[AUTOMATED EVIDENCE LOG - Runtime WAF & Falco]
Active egress filters in place. All TLS endpoints enforce TLS 1.3.
Continuous container integrity validated via Cosign image verification.',
    'Netflix Web',
    'Continue quarterly penetration tests and continuous image signing.'
)
ON CONFLICT (id) DO NOTHING;

-- Integration Configurations
INSERT INTO integration_configs (id, name, display_name, category, endpoint_url, status, error_message) VALUES
('int-github', 'github', 'GitHub Actions & Repository Integration', 'SCM', 'https://api.github.com', 'CONNECTED', NULL),
('int-jenkins', 'jenkins', 'Jenkins Enterprise CI/CD Orchestrator', 'CI_CD', 'http://jenkins.ci.internal:8080', 'CONNECTED', NULL),
('int-vault', 'vault', 'HashiCorp Vault KV Secrets Engine', 'SECRETS', 'http://vault.security.internal:8200', 'CONNECTED', NULL),
('int-trivy', 'trivy', 'Aqua Security Trivy Scanner', 'SCANNER', 'http://trivy-server.internal:4954', 'CONNECTED', NULL),
('int-sonarqube', 'sonarqube', 'SonarQube Enterprise Code Quality', 'SAST', 'http://sonarqube.internal:9000', 'CONNECTED', NULL),
('int-gitleaks', 'gitleaks', 'Gitleaks Secret Detection', 'SECRETS', 'cli://gitleaks:v8.18.2', 'CONNECTED', NULL),
('int-owasp-dc', 'owasp_dependency_check', 'OWASP Dependency-Check', 'SCA', 'cli://dependency-check:v9.0.8', 'CONNECTED', NULL),
('int-hadolint', 'hadolint', 'Hadolint Dockerfile Linter', 'LINTER', 'cli://hadolint:v2.12.0', 'CONNECTED', NULL),
('int-checkov', 'checkov', 'Bridgecrew Checkov IaC Scanner', 'IAC', 'cli://checkov:v3.2.35', 'CONNECTED', NULL),
('int-cosign', 'cosign', 'Sigstore Cosign Image Signer', 'SIGNING', 'cli://cosign:v2.2.3', 'CONNECTED', NULL),
('int-falco', 'falco', 'Sysdig Falco Runtime Threat Detection', 'RUNTIME', 'http://falco-grpc.falco-system:5060', 'CONNECTED', NULL),
('int-kubernetes', 'kubernetes', 'Kubernetes Production Cluster', 'CLUSTER', 'https://k8s-api.prod.internal:6443', 'CONNECTED', NULL)
ON CONFLICT (id) DO NOTHING;

-- Platform Settings
INSERT INTO platform_settings (
    id, platform_name, default_branch, auto_generate_k8s,
    block_deployment_on_critical, block_deployment_on_secrets, require_image_signing,
    require_non_root, require_dependency_scan, require_image_scan,
    notification_critical_findings, notification_failed_pipelines, notification_runtime_alerts, notification_compliance_warnings,
    email_recipients
) VALUES
(
    'default-settings',
    'DevSecOps Enterprise Security & Monitoring Platform',
    'main',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    'secops-team@enterprise.internal, devops-lead@enterprise.internal'
)
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, type, title, message, link_url, is_read, severity) VALUES
('notif-01', 'RUNTIME_ALERT', 'Critical Falco Alert: Shell in Container', 'Interactive root shell spawned inside netflix-clone-backend pod.', '/monitoring', FALSE, 'CRITICAL'),
('notif-02', 'PIPELINE_FAILED', 'Pipeline Execution #141 Blocked', 'Mandatory security gate failed in Hadolint stage (running as root).', '/pipelines', FALSE, 'HIGH'),
('notif-03', 'CRITICAL_FINDING', 'CVE-2022-23529 Patch Proposed', 'Automated patch branch created for jsonwebtoken 9.0.0.', '/security', FALSE, 'CRITICAL')
ON CONFLICT (id) DO NOTHING;
