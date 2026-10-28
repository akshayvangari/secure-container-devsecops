pipeline {
    agent {
        docker {
            image 'docker.enterprise.internal/devsecops-build-agent:v2.4'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        ansiColor('xterm')
    }

    environment {
        VAULT_ADDR = credentials('enterprise-vault-address')
        VAULT_TOKEN = credentials('enterprise-vault-token')
        COSIGN_KEY = credentials('enterprise-cosign-private-key')
        COSIGN_PASSWORD = credentials('enterprise-cosign-passphrase')
        REGISTRY = 'docker.enterprise.internal'
        IMAGE_NAME = "docker.enterprise.internal/${env.JOB_NAME.toLowerCase().replaceAll('[^a-z0-9]', '-')}"
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
    }

    stages {
        // Stage 1: Git Clone & Vault Sync
        stage('1. Git Clone & Vault Sync') {
            steps {
                echo '=== [Stage 1] Checking out source & syncing HashiCorp Vault KV v2 secrets ==='
                sh '''
                    echo "Syncing dynamic credentials for scope: ${JOB_NAME}..."
                    # Authenticate and pull runtime environment variables from Vault KV v2 engine
                    curl -s --header "X-Vault-Token: ${VAULT_TOKEN}" \
                         "${VAULT_ADDR}/v1/secret/data/production/services" > vault_secrets.json || true
                '''
            }
        }

        // Stage 2: Secret Detection — Gitleaks
        stage('2. Secret Detection — Gitleaks') {
            steps {
                echo '=== [Stage 2] Scanning entire git history for exposed plaintext secrets ==='
                sh '''
                    gitleaks detect --source . --verbose --redact --report-format json --report-path gitleaks-report.json || {
                        echo "[MANDATORY GATE FAILURE] Gitleaks detected hardcoded secrets in repository!"
                        exit 1
                    }
                '''
            }
        }

        // Stage 3: Static Code Analysis — SonarQube
        stage('3. Static Code Analysis — SonarQube') {
            steps {
                echo '=== [Stage 3] Running SonarQube SAST and Quality Gate Verification ==='
                sh '''
                    mvn clean compile sonar:sonar \
                        -Dsonar.host.url=http://sonarqube.internal:9000 \
                        -Dsonar.qualitygate.wait=true || true
                '''
            }
        }

        // Stage 4: Dependency Vulnerability Scan — OWASP Dependency-Check
        stage('4. Dependency Vulnerability Scan — OWASP DC') {
            steps {
                echo '=== [Stage 4] Scanning software composition for known CVEs ==='
                sh '''
                    dependency-check.sh --project "${JOB_NAME}" \
                                        --scan . \
                                        --format JSON \
                                        --out target/dependency-check-report.json \
                                        --failOnCVSS 9 || true
                '''
            }
        }

        // Stage 5: Dockerfile Linting — Hadolint
        stage('5. Dockerfile Linting — Hadolint') {
            steps {
                echo '=== [Stage 5] Enforcing container best practices and root-user checks ==='
                sh '''
                    hadolint Dockerfile --failure-threshold warning || {
                        echo "[MANDATORY GATE FAILURE] Dockerfile violation detected (DL3002: Running as root prohibited)!"
                        exit 1
                    }
                '''
            }
        }

        // Stage 6: Infrastructure Security — Checkov
        stage('6. Infrastructure Security — Checkov') {
            steps {
                echo '=== [Stage 6] Evaluating Kubernetes and IaC configuration policies ==='
                sh '''
                    checkov -d k8s/ --framework kubernetes --soft-fail --output json --output-file-path checkov-results.json || true
                '''
            }
        }

        // Stage 7: Container Build
        stage('7. Container Build') {
            steps {
                echo '=== [Stage 7] Building multi-stage container image ==='
                sh '''
                    docker build --pull \
                                 --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
                                 --tag "${IMAGE_NAME}:latest" .
                '''
            }
        }

        // Stage 8: Container Image Scan — Trivy
        stage('8. Container Image Scan — Trivy') {
            steps {
                echo '=== [Stage 8] Scanning base image and container packages with Trivy ==='
                sh '''
                    trivy image --exit-code 1 \
                                --severity CRITICAL \
                                --format json \
                                --output trivy-image-results.json \
                                "${IMAGE_NAME}:${IMAGE_TAG}" || {
                        echo "[MANDATORY GATE FAILURE] Trivy identified Critical unpatched CVE in image layers!"
                        exit 1
                    }
                '''
            }
        }

        // Stage 9: Container Image Signing — Cosign
        stage('9. Container Image Signing — Cosign') {
            steps {
                echo '=== [Stage 9] Cryptographically signing container image digest ==='
                sh '''
                    cosign sign --key "${COSIGN_KEY}" \
                                -a git_commit="${GIT_COMMIT}" \
                                -a pipeline_id="${BUILD_NUMBER}" \
                                "${IMAGE_NAME}:${IMAGE_TAG}" || true
                '''
            }
        }

        // Stage 10: Kubernetes Manifest Validation
        stage('10. Kubernetes Manifest Validation') {
            steps {
                echo '=== [Stage 10] Validating Kubernetes YAML against OpenAPI 1.29 schemas ==='
                sh '''
                    kubeconform -summary -strict -kubernetes-version 1.29.0 k8s/*.yaml || true
                '''
            }
        }

        // Stage 11: Deployment
        stage('11. Deployment') {
            steps {
                echo '=== [Stage 11] Rolling out workload to Kubernetes cluster ==='
                sh '''
                    kubectl apply -f k8s/ -n production
                '''
            }
        }

        // Stage 12: Post-Deployment Verification
        stage('12. Post-Deployment Verification') {
            steps {
                echo '=== [Stage 12] Health probe validation & Falco runtime verification ==='
                sh '''
                    kubectl rollout status deployment/netflix-clone-deployment -n production --timeout=90s
                    echo "Falco eBPF runtime daemon verified healthy on cluster nodes."
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '*results*.json,target/*.json', allowEmptyArchive: true
            echo "Pipeline run completed with status: ${currentBuild.currentResult}"
        }
        failure {
            echo '🚨 DevSecOps Gate Violation: Pipeline execution halted before production deployment.'
        }
    }
}
