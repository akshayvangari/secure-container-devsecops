export interface Project {
  id: string;
  name: string;
  slug: string;
  repositoryUrl: string;
  defaultBranch: string;
  workspacePath?: string;
  description?: string;
  language?: string;
  framework?: string;
  securityScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  exposedSecretCount: number;
  pipelineStatus: 'PASSED' | 'FAILED' | 'RUNNING' | 'QUEUED';
  projectStatus: string;
  serverStatus: 'RUNNING' | 'STOPPED';
  devServerPort?: number;
  dependencyCount: number;
  fileCount: number;
  hasDockerfile: boolean;
  hasK8sManifest: boolean;
  hasIac: boolean;
  lastScannedAt?: string;
}

export interface SecurityFinding {
  id: string;
  projectId: string;
  category: 'CVE' | 'SECRET' | 'SAST' | 'DOCKER' | 'IAC' | 'RUNTIME';
  title: string;
  cveId?: string;
  packageName?: string;
  installedVersion?: string;
  fixedVersion?: string;
  filePath?: string;
  lineNumber?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  cvssScore?: number;
  exploitability?: string;
  toolName: string;
  description?: string;
  remediationGuidance?: string;
  remediationStatus: 'OPEN' | 'IN_REVIEW' | 'PATCH_PROPOSED' | 'RESOLVED' | 'SUPPRESSED';
  firstDetectedAt: string;
  lastDetectedAt: string;
}

export interface PipelineExecution {
  id: string;
  projectId: string;
  executionNumber: number;
  branch: string;
  commitHash: string;
  commitMessage: string;
  triggeredBy: string;
  status: 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'CANCELLED';
  durationSeconds: number;
  securityGatePassed: boolean;
  blockedReason?: string;
  startedAt?: string;
  endedAt?: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id?: string;
  name: string;
  toolName?: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  duration?: number;
  isGate: boolean;
  errorMessage?: string;
}

export interface RemediationJob {
  id: string;
  projectId: string;
  findingId: string;
  packageName: string;
  previousVersion: string;
  proposedVersion: string;
  targetBranch: string;
  remediationBranch: string;
  diffContent?: string;
  status: 'PROPOSED' | 'APPROVED' | 'TESTING' | 'PR_CREATED' | 'MERGED' | 'REJECTED' | 'FAILED';
  compatibilityWarning?: string;
  testRunStatus?: string;
  githubPrNumber?: number;
  githubPrUrl?: string;
  remediationLog?: string;
}

export interface VaultSecret {
  id: string;
  projectId: string;
  secretKey: string;
  secretPath: string;
  secretType: string;
  storageBackend: string;
  currentVersion: number;
  status: string;
  maskedValue: string;
  lastRotatedAt: string;
}

export interface RuntimeAlert {
  id: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  podName: string;
  containerName?: string;
  namespace: string;
  clusterName?: string;
  description: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  timestamp: string;
}

export interface KubernetesPod {
  id: string;
  podName: string;
  namespace: string;
  appLabel?: string;
  status: string;
  image: string;
  restarts: number;
  readyReplicas: string;
  cpuCores: string;
  memoryMb: string;
  securityContextCompliant: boolean;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlCode: string;
  controlName: string;
  requirements: string;
  category: string;
  severity: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_EVALUATED';
  technicalEvidence?: string;
  linkedProject?: string;
  remediationGuidance?: string;
}
