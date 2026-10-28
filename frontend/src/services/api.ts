import axios from 'axios';
import { Project, SecurityFinding, PipelineExecution, RemediationJob, VaultSecret, RuntimeAlert, KubernetesPod, ComplianceControl } from '../types';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Dashboard
  getDashboardSummary: () => client.get('/dashboard/summary').then(r => r.data),
  getVulnerabilityTrends: () => client.get('/dashboard/vulnerability-trends').then(r => r.data),
  getRecentActivity: () => client.get('/dashboard/recent-activity').then(r => r.data),

  // Projects
  getProjects: () => client.get<Project[]>('/projects').then(r => r.data),
  getProjectById: (id: string) => client.get<Project>(`/projects/${id}`).then(r => r.data),
  createProject: (data: Partial<Project>) => client.post<Project>('/projects', data).then(r => r.data),
  updateProject: (id: string, data: Partial<Project>) => client.put<Project>(`/projects/${id}`, data).then(r => r.data),
  deleteProject: (id: string) => client.delete(`/projects/${id}`).then(r => r.data),
  scanProject: (id: string) => client.post(`/projects/${id}/scan`).then(r => r.data),
  getDockerfilePreview: (id: string) => client.get(`/projects/${id}/dockerfile-preview`).then(r => r.data),

  // Pipelines
  getPipelines: () => client.get<PipelineExecution[]>('/pipelines').then(r => r.data),
  triggerPipeline: (projectId: string, branch = 'main') => client.post<PipelineExecution>('/pipelines/trigger', { projectId, branch }).then(r => r.data),
  cancelPipeline: (id: string) => client.post(`/pipelines/${id}/cancel`).then(r => r.data),
  getPipelineLogs: (id: string) => client.get(`/pipelines/${id}/logs`).then(r => r.data),
  getJenkinsfile: () => client.get('/pipelines/jenkinsfile-template').then(r => r.data),

  // Security
  getFindings: (projectId?: string) => client.get<SecurityFinding[]>('/security/findings', { params: { projectId } }).then(r => r.data),
  getSecuritySummary: () => client.get('/security/summary').then(r => r.data),
  patchPackage: (findingId: string, proposedVersion: string) => client.post<RemediationJob>('/security/patch-package', { findingId, proposedVersion }).then(r => r.data),
  getRemediations: () => client.get<RemediationJob[]>('/security/remediations').then(r => r.data),
  approveRemediation: (id: string) => client.post<RemediationJob>(`/security/remediations/${id}/approve`).then(r => r.data),
  rejectRemediation: (id: string) => client.post<RemediationJob>(`/security/remediations/${id}/reject`).then(r => r.data),
  updateFindingStatus: (id: string, status: string) => client.patch<SecurityFinding>(`/security/findings/${id}/status`, null, { params: { status } }).then(r => r.data),

  // Vault
  getVaultSecrets: () => client.get<VaultSecret[]>('/vault/secrets').then(r => r.data),
  createVaultSecret: (data: Partial<VaultSecret>) => client.post<VaultSecret>('/vault/secrets', data).then(r => r.data),
  rotateVaultSecret: (id: string) => client.post<VaultSecret>(`/vault/secrets/${id}/rotate`).then(r => r.data),
  deleteVaultSecret: (id: string) => client.delete(`/vault/secrets/${id}`).then(r => r.data),
  getVaultStatus: () => client.get('/vault/status').then(r => r.data),
  testVaultConnection: () => client.post('/vault/test-connection').then(r => r.data),

  // Runtime
  getRuntimeSummary: () => client.get('/runtime/summary').then(r => r.data),
  getPods: () => client.get<KubernetesPod[]>('/runtime/pods').then(r => r.data),
  getAlerts: () => client.get<RuntimeAlert[]>('/runtime/alerts').then(r => r.data),
  acknowledgeAlert: (id: string) => client.post<RuntimeAlert>(`/runtime/alerts/${id}/acknowledge`).then(r => r.data),

  // Compliance
  getComplianceSummary: () => client.get('/compliance/summary').then(r => r.data),
  getComplianceControls: (frameworkId?: string) => client.get<ComplianceControl[]>('/compliance/controls', { params: { frameworkId } }).then(r => r.data),
  triggerAudit: () => client.post('/compliance/audit').then(r => r.data),
  exportAuditPackage: () => client.get('/compliance/export').then(r => r.data),

  // AI Assistant
  askAssistant: (message: string) => client.post('/assistant/chat', { message }).then(r => r.data),

  // Settings
  getSettings: () => client.get('/settings').then(r => r.data),
  updateSettings: (data: any) => client.put('/settings', data).then(r => r.data),
  getIntegrations: () => client.get('/settings/integrations').then(r => r.data),
  testIntegration: (name: string) => client.post(`/settings/integrations/${name}/test`).then(r => r.data)
};
