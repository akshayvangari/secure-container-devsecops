-- V1__init_schema.sql
-- DevSecOps Platform PostgreSQL Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users and Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 2. Projects
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    repository_url VARCHAR(500) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    workspace_path VARCHAR(500),
    description TEXT,
    language VARCHAR(100),
    framework VARCHAR(100),
    security_score INTEGER DEFAULT 100,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    exposed_secret_count INTEGER DEFAULT 0,
    pipeline_status VARCHAR(50) DEFAULT 'PASSED',
    project_status VARCHAR(50) DEFAULT 'ACTIVE',
    server_status VARCHAR(50) DEFAULT 'STOPPED',
    dev_server_port INTEGER,
    dependency_count INTEGER DEFAULT 0,
    file_count INTEGER DEFAULT 0,
    has_dockerfile BOOLEAN DEFAULT FALSE,
    has_k8s_manifest BOOLEAN DEFAULT FALSE,
    has_iac BOOLEAN DEFAULT FALSE,
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_score ON projects(security_score);

-- 3. Project Scans
CREATE TABLE IF NOT EXISTS project_scans (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL, -- SAST, DAST, SCA, SECRETS, DOCKER, K8S, FULL
    status VARCHAR(50) NOT NULL,    -- QUEUED, RUNNING, COMPLETED, FAILED
    tool_name VARCHAR(100) NOT NULL,
    findings_count INTEGER DEFAULT 0,
    critical_findings INTEGER DEFAULT 0,
    high_findings INTEGER DEFAULT 0,
    medium_findings INTEGER DEFAULT 0,
    low_findings INTEGER DEFAULT 0,
    score_delta INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    raw_output_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_scans_proj ON project_scans(project_id);

-- 4. Security Findings & CVE Records
CREATE TABLE IF NOT EXISTS security_findings (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scan_id VARCHAR(64) REFERENCES project_scans(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- CVE, SECRET, SAST, DOCKER, IAC, RUNTIME
    title VARCHAR(255) NOT NULL,
    cve_id VARCHAR(100),
    package_name VARCHAR(150),
    installed_version VARCHAR(100),
    fixed_version VARCHAR(100),
    file_path VARCHAR(500),
    line_number INTEGER,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW, INFO
    cvss_score NUMERIC(4, 1),
    exploitability VARCHAR(50),     -- PROOF_OF_CONCEPT, FUNCTIONAL, HIGH, UNPROVEN
    tool_name VARCHAR(100) NOT NULL,
    description TEXT,
    remediation_guidance TEXT,
    remediation_status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_REVIEW, PATCH_PROPOSED, RESOLVED, SUPPRESSED
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_security_findings_proj ON security_findings(project_id);
CREATE INDEX idx_security_findings_sev ON security_findings(severity);
CREATE INDEX idx_security_findings_status ON security_findings(remediation_status);
CREATE INDEX idx_security_findings_cve ON security_findings(cve_id);

-- 5. Secret Detection Records
CREATE TABLE IF NOT EXISTS secret_detection_records (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    finding_id VARCHAR(64) REFERENCES security_findings(id) ON DELETE CASCADE,
    secret_type VARCHAR(100) NOT NULL, -- AWS_KEY, GITHUB_TOKEN, RSA_PRIVATE_KEY, API_TOKEN, DB_CREDENTIAL
    masked_value VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    line_number INTEGER,
    commit_hash VARCHAR(64),
    author VARCHAR(100),
    entropy NUMERIC(5, 2),
    is_revoked BOOLEAN DEFAULT FALSE,
    remediation_status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Remediation Jobs & Pull Requests
CREATE TABLE IF NOT EXISTS remediation_jobs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    finding_id VARCHAR(64) REFERENCES security_findings(id) ON DELETE CASCADE,
    package_name VARCHAR(150) NOT NULL,
    previous_version VARCHAR(100) NOT NULL,
    proposed_version VARCHAR(100) NOT NULL,
    target_branch VARCHAR(100) DEFAULT 'main',
    remediation_branch VARCHAR(150) NOT NULL,
    diff_content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED', -- PROPOSED, APPROVED, TESTING, PR_CREATED, MERGED, REJECTED, FAILED
    compatibility_warning TEXT,
    test_run_status VARCHAR(50),
    github_pr_number INTEGER,
    github_pr_url VARCHAR(500),
    remediation_log TEXT,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pipeline Executions, Stages & Logs
CREATE TABLE IF NOT EXISTS pipeline_executions (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    execution_number INTEGER NOT NULL,
    branch VARCHAR(100) NOT NULL,
    commit_hash VARCHAR(64) NOT NULL,
    commit_message VARCHAR(500),
    triggered_by VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- QUEUED, RUNNING, PASSED, FAILED, CANCELLED
    duration_seconds INTEGER DEFAULT 0,
    security_gate_passed BOOLEAN DEFAULT TRUE,
    blocked_reason TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pipe_exec_proj ON pipeline_executions(project_id);

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id VARCHAR(64) PRIMARY KEY,
    execution_id VARCHAR(64) NOT NULL REFERENCES pipeline_executions(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    tool_name VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, PASSED, FAILED, SKIPPED
    duration_seconds INTEGER DEFAULT 0,
    is_gate BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pipe_stages_exec ON pipeline_stages(execution_id);

CREATE TABLE IF NOT EXISTS pipeline_logs (
    id VARCHAR(64) PRIMARY KEY,
    stage_id VARCHAR(64) NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
    log_text TEXT NOT NULL,
    log_level VARCHAR(20) DEFAULT 'INFO',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. HashiCorp Vault Secrets Metadata
CREATE TABLE IF NOT EXISTS vault_secret_metadata (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    secret_key VARCHAR(150) NOT NULL,
    secret_path VARCHAR(255) NOT NULL,
    secret_type VARCHAR(100) NOT NULL, -- DATABASE, API_KEY, CERTIFICATE, CLOUD_CREDENTIAL, SSH_KEY
    storage_backend VARCHAR(100) DEFAULT 'HashiCorp Vault KV v2',
    current_version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ROTATING, DEPRECATED, REVOKED
    masked_value VARCHAR(100) NOT NULL,
    last_rotated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Runtime Threat Detection & Falco Alerts
CREATE TABLE IF NOT EXISTS runtime_alerts (
    id VARCHAR(64) PRIMARY KEY,
    rule_name VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, WARNING, INFO
    pod_name VARCHAR(150) NOT NULL,
    container_name VARCHAR(150),
    namespace VARCHAR(100) NOT NULL DEFAULT 'production',
    cluster_name VARCHAR(100) DEFAULT 'prod-k8s-cluster-01',
    description TEXT NOT NULL,
    event_metadata JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_runtime_alerts_sev ON runtime_alerts(severity);
CREATE INDEX idx_runtime_alerts_ack ON runtime_alerts(acknowledged);

CREATE TABLE IF NOT EXISTS kubernetes_pods (
    id VARCHAR(64) PRIMARY KEY,
    pod_name VARCHAR(150) NOT NULL UNIQUE,
    namespace VARCHAR(100) NOT NULL DEFAULT 'production',
    app_label VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- Running, CrashLoopBackOff, Pending, Completed
    image VARCHAR(255) NOT NULL,
    restarts INTEGER DEFAULT 0,
    ready_replicas VARCHAR(50) DEFAULT '1/1',
    cpu_cores VARCHAR(50) DEFAULT '0.12 cores',
    memory_mb VARCHAR(50) DEFAULT '184 MB',
    security_context_compliant BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Compliance Frameworks & Controls
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    compliance_score INTEGER DEFAULT 0,
    total_controls INTEGER DEFAULT 0,
    passed_controls INTEGER DEFAULT 0,
    warning_controls INTEGER DEFAULT 0,
    failed_controls INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compliance_controls (
    id VARCHAR(64) PRIMARY KEY,
    framework_id VARCHAR(50) NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    control_code VARCHAR(100) NOT NULL,
    control_name VARCHAR(255) NOT NULL,
    requirements TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(50) NOT NULL DEFAULT 'PASS', -- PASS, WARNING, FAIL, NOT_EVALUATED
    technical_evidence TEXT,
    linked_project VARCHAR(150),
    remediation_guidance TEXT,
    last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_controls_fw ON compliance_controls(framework_id);
CREATE INDEX idx_compliance_controls_st ON compliance_controls(status);

CREATE TABLE IF NOT EXISTS compliance_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    framework_id VARCHAR(50) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    passed_count INTEGER NOT NULL,
    warning_count INTEGER NOT NULL,
    failed_count INTEGER NOT NULL,
    evaluated_by VARCHAR(100) DEFAULT 'Automated Gate Engine',
    audit_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_evidence (
    id VARCHAR(64) PRIMARY KEY,
    control_id VARCHAR(64) REFERENCES compliance_controls(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL,
    source_tool VARCHAR(100) NOT NULL,
    evidence_payload TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Platform Settings & Integration Configs
CREATE TABLE IF NOT EXISTS platform_settings (
    id VARCHAR(64) PRIMARY KEY,
    platform_name VARCHAR(150) DEFAULT 'DevSecOps Enterprise Security',
    default_branch VARCHAR(100) DEFAULT 'main',
    auto_generate_k8s BOOLEAN DEFAULT TRUE,
    block_deployment_on_critical BOOLEAN DEFAULT TRUE,
    block_deployment_on_secrets BOOLEAN DEFAULT TRUE,
    require_image_signing BOOLEAN DEFAULT TRUE,
    require_non_root BOOLEAN DEFAULT TRUE,
    require_dependency_scan BOOLEAN DEFAULT TRUE,
    require_image_scan BOOLEAN DEFAULT TRUE,
    notification_critical_findings BOOLEAN DEFAULT TRUE,
    notification_failed_pipelines BOOLEAN DEFAULT TRUE,
    notification_runtime_alerts BOOLEAN DEFAULT TRUE,
    notification_compliance_warnings BOOLEAN DEFAULT TRUE,
    slack_webhook_url VARCHAR(500),
    teams_webhook_url VARCHAR(500),
    email_recipients VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_configs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    endpoint_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'CONNECTED', -- CONNECTED, DISCONNECTED, ERROR, NOT_CONFIGURED, DEMO_MODE
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    config_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs, Notifications & Reports
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    username VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- CRITICAL_FINDING, PIPELINE_FAILED, RUNTIME_ALERT, COMPLIANCE_WARNING
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_records (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    format VARCHAR(20) DEFAULT 'PDF',
    status VARCHAR(50) DEFAULT 'GENERATED',
    file_path VARCHAR(500),
    generated_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
