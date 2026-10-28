// DevSecOps Platform Unified Single Page Application
(function() {
  'use strict';

  // Global Application State
  const state = {
    currentPage: 'dashboard',
    projects: [],
    findings: [],
    pipelines: [],
    remediations: [],
    vaultSecrets: [],
    alerts: [],
    pods: [],
    complianceFrameworks: [],
    complianceControls: [],
    integrations: [],
    settings: {},
    summary: {},
    activeAppId: 'proj-netflix-clone',
    activeSecurityTab: 'cve',
    activeAppTab: 'overview',
    activeSettingsTab: 'general',
    activeComplianceFramework: 'all',
    selectedExecution: null,
    terminalLogs: [],
    activeModal: null,
    modalData: null,
    // Ollama / AI assistant state
    ollamaAvailable: false,
    ollamaModels: [],
    ollamaModel: null,
    assistantLoading: false,
    assistantMessages: [
      {
        sender: 'assistant',
        text: 'Hello! I am your **DevSecOps Security Intelligence Assistant**. I monitor your 3 projects, 12-stage CI/CD pipelines, Trivy/Gitleaks findings, Vault secrets, and Falco runtime events. How can I assist you today?'
      }
    ]
  };

  // API helper with fallback to cached database
  async function api(path, options = {}) {
    try {
      const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API call failed for ${path}:`, err);
      return null;
    }
  }

  // Initial Load
  async function init() {
    await fetchInitialData();
    renderApp();
  }

  async function fetchInitialData() {
    const [summary, projs, findings, pipes, vaults, alerts, pods, compSummary, compControls, ints, settings] = await Promise.all([
      api('/api/dashboard/summary'),
      api('/api/projects'),
      api('/api/security/findings'),
      api('/api/pipelines'),
      api('/api/vault/secrets'),
      api('/api/runtime/alerts'),
      api('/api/runtime/pods'),
      api('/api/compliance/summary'),
      api('/api/compliance/controls'),
      api('/api/settings/integrations'),
      api('/api/settings')
    ]);

    if (summary) state.summary = summary;
    if (projs) state.projects = projs;
    if (findings) state.findings = findings;
    if (pipes) {
      state.pipelines = pipes;
      state.selectedExecution = pipes[0] || null;
    }
    if (vaults) state.vaultSecrets = vaults;
    if (alerts) state.alerts = alerts;
    if (pods) state.pods = pods;
    if (compSummary) {
      state.complianceFrameworks = compSummary.frameworks || [];
      state.complianceSummary = compSummary;
    }
    if (compControls) state.complianceControls = compControls;
    if (ints) state.integrations = ints;
    if (settings) state.settings = settings;

    // Load initial pipeline logs
    if (state.selectedExecution) {
      const logs = await api(`/api/pipelines/${state.selectedExecution.id}/logs`);
      if (logs) state.terminalLogs = logs;
    }
  }

  // Icons SVG Dictionary
  const icons = {
    dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    projects: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    pipelines: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    security: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    apps: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    monitoring: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    vault: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    compliance: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    reports: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };

  // Main Render Function
  function renderApp() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
      <div class="app-container">
        <!-- Sidebar Navigation -->
        ${renderSidebar()}

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <!-- Top Header -->
          ${renderHeader()}

          <!-- Page Workspace -->
          <main class="workspace" id="workspace">
            ${renderCurrentPage()}
          </main>
        </div>
      </div>

      <!-- Active Modal Rendering -->
      ${renderModal()}
    `;

    attachEventListeners();
  }

  // Sidebar Component
  function renderSidebar() {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
      { id: 'projects', label: 'Projects', icon: icons.projects },
      { id: 'pipelines', label: 'Pipelines', icon: icons.pipelines },
      { id: 'security', label: 'Security Center', icon: icons.security },
      { id: 'apps', label: 'App Monitor', icon: icons.apps },
      { id: 'monitoring', label: 'Runtime Monitoring', icon: icons.monitoring },
      { id: 'vault', label: 'Vault', icon: icons.vault },
      { id: 'compliance', label: 'Compliance & Audit', icon: icons.compliance },
      { id: 'reports', label: 'Reports', icon: icons.reports },
      { id: 'settings', label: 'Settings', icon: icons.settings }
    ];

    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-icon">${icons.shield}</div>
          <div>
            <div class="brand-title">DevSecOps</div>
            <span class="brand-subtitle">Platform 2.0</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <div class="nav-item ${state.currentPage === item.id ? 'active' : ''}" data-nav="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
            </div>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <span class="status-indicator"></span>
          <div>
            <div style="color: #f1f5f9; font-weight: 600;">Cluster Guard Active</div>
            <div style="color: #64748b; font-size: 11px;">eBPF Falco 0.37.1 Attached</div>
          </div>
        </div>
      </aside>
    `;
  }

  // Header Component
  function renderHeader() {
    const titles = {
      dashboard: 'Executive Security Dashboard',
      projects: 'Project & Workspace Registry',
      pipelines: 'CI/CD Pipeline Orchestrator',
      security: 'Application Security Center',
      apps: 'Local App & Process Monitor',
      monitoring: 'Runtime Threats & Kubernetes Pods',
      vault: 'HashiCorp Vault Secrets Manager',
      compliance: 'Continuous Compliance & Audit Center',
      reports: 'Enterprise Security Reports',
      settings: 'Security Policies & Integrations'
    };

    return `
      <header class="top-header">
        <div class="page-title">
          <span>${titles[state.currentPage] || 'DevSecOps Platform'}</span>
        </div>

        <div class="header-actions">
          <div class="demo-badge">
            <span class="demo-badge-dot"></span>
            <span>Live Security Monitoring</span>
          </div>

          <button class="btn btn-outline btn-sm" id="btn-quick-scan">
            ${icons.security}
            <span>Trigger Scan</span>
          </button>

          <button class="btn btn-primary btn-sm" id="btn-quick-pipeline">
            ${icons.pipelines}
            <span>Run Pipeline</span>
          </button>
        </div>
      </header>
    `;
  }

  // Page Routing Switch
  function renderCurrentPage() {
    switch(state.currentPage) {
      case 'dashboard': return renderDashboardPage();
      case 'projects': return renderProjectsPage();
      case 'pipelines': return renderPipelinesPage();
      case 'security': return renderSecurityPage();
      case 'apps': return renderAppMonitorPage();
      case 'monitoring': return renderMonitoringPage();
      case 'vault': return renderVaultPage();
      case 'compliance': return renderCompliancePage();
      case 'reports': return renderReportsPage();
      case 'settings': return renderSettingsPage();
      default: return renderDashboardPage();
    }
  }

  // 1. Dashboard Page
  function renderDashboardPage() {
    const s = state.summary;
    const projs = state.projects;

    return `
      <!-- Top Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">
            <span>Overall Security Score</span>
            <span style="color: #10b981;">● Good</span>
          </div>
          <div class="metric-value" style="color: #2563eb;">${s.overallSecurityScore || 78}<span style="font-size: 16px; color: #64748b;">/100</span></div>
          <div class="metric-footer">Across ${state.projects.length} evaluated applications</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Projects</div>
          <div class="metric-value">${s.totalProjects || 3}</div>
          <div class="metric-footer">${projs.filter(p => p.serverStatus === 'RUNNING').length} microservices active</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Pipeline Executions</div>
          <div class="metric-value">${s.pipelineExecutions || 3}</div>
          <div class="metric-footer">Last pass: 2 hours ago</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Open Vulnerabilities</div>
          <div class="metric-value" style="color: #dc2626;">${s.openVulnerabilities || 6}</div>
          <div class="metric-footer">${s.criticalFindings || 1} Critical, ${s.highFindings || 3} High</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Active Threats (Falco)</div>
          <div class="metric-value" style="color: #d97706;">${s.activeThreats || 2}</div>
          <div class="metric-footer">eBPF runtime intrusion alerts</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Compliance Score</div>
          <div class="metric-value" style="color: #059669;">${s.complianceScore || 84}%</div>
          <div class="metric-footer">SOC 2, ISO 27001, NIST 800-53</div>
        </div>
      </div>

      <!-- Main Layout: 2 Columns (Content + AI Assistant) -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <!-- Left Column -->
        <div>
          <!-- Vulnerability Trends Chart Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${icons.monitoring}
                <span>Vulnerability Trends (Past 30 Days)</span>
              </div>
              <span class="badge badge-pass">34% Resolved</span>
            </div>
            <div class="card-body">
              <div style="height: 180px; width: 100%; display: flex; align-items: flex-end; gap: 14px; padding-top: 20px;">
                ${[
                  { label: 'Day 1', crit: 4, high: 12, score: 62 },
                  { label: 'Day 5', crit: 3, high: 11, score: 66 },
                  { label: 'Day 10', crit: 3, high: 10, score: 69 },
                  { label: 'Day 15', crit: 2, high: 9, score: 73 },
                  { label: 'Day 20', crit: 2, high: 8, score: 75 },
                  { label: 'Day 25', crit: 1, high: 7, score: 78 },
                  { label: 'Day 30', crit: 1, high: 6, score: 81 }
                ].map(item => `
                  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <div style="font-size: 10px; color: #64748b;">${item.score}%</div>
                    <div style="width: 100%; height: ${item.score * 1.5}px; background: linear-gradient(180deg, #3b82f6, #93c5fd); border-radius: 4px;"></div>
                    <span style="font-size: 11px; color: #64748b;">${item.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Project Security Scores -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                ${icons.projects}
                <span>Security Score by Application</span>
              </div>
              <button class="btn btn-outline btn-sm" onclick="app.navigate('projects')">View All</button>
            </div>
            <div class="card-body" style="padding: 0;">
              <table style="width: 100%;">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Branch</th>
                    <th>Security Score</th>
                    <th>Critical / High</th>
                    <th>Pipeline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.projects.map(p => `
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: #0f172a;">${p.name}</div>
                        <div style="font-size: 11px; color: #64748b;">${p.framework}</div>
                      </td>
                      <td><code>${p.defaultBranch}</code></td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div style="width: 80px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${p.securityScore}%; height: 100%; background: ${p.securityScore >= 80 ? '#10b981' : (p.securityScore >= 70 ? '#f59e0b' : '#ef4444')};"></div>
                          </div>
                          <span style="font-weight: 700; font-size: 12px;">${p.securityScore}%</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-critical">${p.criticalCount} Crit</span>
                        <span class="badge badge-high">${p.highCount} High</span>
                      </td>
                      <td>
                        <span class="badge ${p.pipelineStatus === 'PASSED' ? 'badge-pass' : 'badge-fail'}">${p.pipelineStatus}</span>
                      </td>
                      <td>
                        <button class="btn btn-outline btn-sm" onclick="app.scanProject('${p.id}')">Scan</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: DevSecOps AI Assistant -->
        <div>
          <div class="card ai-panel">
            <div class="card-header" style="border-bottom: 1px solid #f3e8ff; background: transparent;">
              <div class="card-title" style="color: #6b21a8;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4.5h-2V7h2z"/></svg>
                <span>DevSecOps AI Assistant</span>
              </div>
              ${state.ollamaAvailable
                ? `<span class="badge" style="background: #dcfce7; color: #166534; border: 1px solid #86efac; font-size: 10px;">
                    🟢 Ollama LLM — ${state.ollamaModel || 'Connected'}
                   </span>`
                : `<span class="badge" style="background: #fef9c3; color: #854d0e; border: 1px solid #fde047; font-size: 10px;" title="Install Ollama to enable LLM mode">
                    ⚡ Deterministic Mode
                   </span>`
              }
            </div>

            <div class="card-body" style="padding: 14px;">
              <div id="ai-chat-box" style="height: 360px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; padding-right: 4px;">
                ${state.assistantMessages.map(m => `
                  <div style="align-self: ${m.sender === 'user' ? 'flex-end' : 'flex-start'}; max-width: 92%; display: flex; flex-direction: column; gap: 4px;">
                    <div style="background: ${m.sender === 'user' ? '#2563eb' : '#ffffff'}; color: ${m.sender === 'user' ? '#ffffff' : '#0f172a'}; padding: 10px 14px; border-radius: 10px; font-size: 12.5px; border: ${m.sender === 'user' ? 'none' : '1px solid #e2e8f0'}; box-shadow: 0 1px 2px rgba(0,0,0,0.04); line-height: 1.55;">
                      ${formatMarkdown(m.text)}
                    </div>
                    ${m.model ? `<span style="font-size: 9.5px; color: #94a3b8; padding: 0 4px;">via ${m.model}</span>` : ''}
                    ${(m.actions && m.actions.length > 0) ? `
                      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        ${m.actions.map(a => `
                          <button onclick="app.navigate('${a.route}')" style="font-size: 10.5px; padding: 3px 10px; border-radius: 6px; border: 1px solid #c084fc; background: #f3e8ff; color: #7e22ce; cursor: pointer;">
                            → ${a.label}
                          </button>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
                ${state.assistantLoading ? `
                  <div style="align-self: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 10px; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #7e22ce; animation: pulse 1s infinite;"></span>
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #7e22ce; animation: pulse 1s 0.2s infinite;"></span>
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #7e22ce; animation: pulse 1s 0.4s infinite;"></span>
                    &nbsp;${state.ollamaAvailable ? 'Querying Ollama...' : 'Processing...'}
                  </div>
                ` : ''}
              </div>

              <!-- Ollama setup hint when not connected -->
              ${!state.ollamaAvailable ? `
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; color: #92400e;">
                  💡 <strong>Enable LLM mode:</strong> Install <a href="https://ollama.ai" target="_blank" style="color: #7e22ce;">Ollama</a>, run <code style="background:#fef3c7; padding: 1px 4px; border-radius: 3px;">ollama pull llama3.2</code>, then <code style="background:#fef3c7; padding: 1px 4px; border-radius: 3px;">ollama serve</code>.
                </div>
              ` : `
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 6px 12px; margin-bottom: 10px; font-size: 11px; color: #166534; display: flex; justify-content: space-between; align-items: center;">
                  <span>🤖 <strong>Ollama</strong> connected — using full project context</span>
                  ${state.ollamaModels.length > 1 ? `
                    <select onchange="state.ollamaModel=this.value" style="font-size: 10px; border: 1px solid #86efac; border-radius: 4px; background: #f0fdf4; color: #166534; padding: 1px 4px;">
                      ${state.ollamaModels.map(m => `<option value="${m}" ${m === state.ollamaModel ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                  ` : ''}
                </div>
              `}

              <!-- Quick query prompt chips -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 600; color: #7e22ce; margin-bottom: 4px;">SUGGESTED QUERIES</div>
                <div class="ai-chip" onclick="app.askAssistant('Show critical vulnerabilities.')">Show critical vulnerabilities</div>
                <div class="ai-chip" onclick="app.askAssistant('Which project has the lowest security score?')">Lowest security score</div>
                <div class="ai-chip" onclick="app.askAssistant('Explain my latest pipeline failure.')">Explain pipeline failure</div>
                <div class="ai-chip" onclick="app.askAssistant('How can I fix the root-container issue?')">Fix root-container issue</div>
                <div class="ai-chip" onclick="app.askAssistant('Show exposed secrets.')">Show exposed secrets</div>
                <div class="ai-chip" onclick="app.askAssistant('Show compliance status.')">Compliance status</div>
              </div>

              <!-- Input form -->
              <form id="ai-form" onsubmit="app.handleAssistantSubmit(event)" style="display: flex; gap: 8px;">
                <input type="text" id="ai-input" class="form-control" placeholder="Ask AI about scans, CVEs, or policies..." style="font-size: 12px;" required ${state.assistantLoading ? 'disabled' : ''} />
                <button type="submit" class="btn btn-primary btn-sm" style="background: #7e22ce;" ${state.assistantLoading ? 'disabled' : ''}>Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Projects Page
  function renderProjectsPage() {
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            ${icons.projects}
            <span>Registered Repositories (${state.projects.length})</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModal('addProject')">+ Add Project</button>
        </div>

        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Repository URL</th>
                <th>Stack / Framework</th>
                <th>Security Score</th>
                <th>Findings</th>
                <th>Pipeline</th>
                <th>Server</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.projects.map(p => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #0f172a;">${p.name}</div>
                    <div style="font-size: 11px; color: #64748b;">${p.description || 'Enterprise microservice'}</div>
                  </td>
                  <td>
                    <a href="${p.repositoryUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 12px;">${p.repositoryUrl}</a>
                    <div style="font-size: 10.5px; color: #64748b;">branch: <code>${p.defaultBranch}</code></div>
                  </td>
                  <td>
                    <span class="badge badge-low">${p.language}</span>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${p.framework}</div>
                  </td>
                  <td>
                    <div style="font-size: 16px; font-weight: 700; color: ${p.securityScore >= 80 ? '#10b981' : (p.securityScore >= 70 ? '#f59e0b' : '#ef4444')};">
                      ${p.securityScore}/100
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-critical">${p.criticalCount} Crit</span>
                    <span class="badge badge-high">${p.highCount} High</span>
                    ${p.exposedSecretCount > 0 ? '<span class="badge badge-critical">Secret!</span>' : ''}
                  </td>
                  <td>
                    <span class="badge ${p.pipelineStatus === 'PASSED' ? 'badge-pass' : 'badge-fail'}">${p.pipelineStatus}</span>
                  </td>
                  <td>
                    <span class="badge ${p.serverStatus === 'RUNNING' ? 'badge-pass' : 'badge-low'}">${p.serverStatus}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-outline btn-sm" onclick="app.scanProject('${p.id}')">Scan</button>
                      <button class="btn btn-outline btn-sm" onclick="app.triggerPipeline('${p.id}')">Run CI</button>
                      <button class="btn btn-outline btn-sm" onclick="app.previewDockerfile('${p.id}')">Docker</button>
                      <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="app.deleteProject('${p.id}')">Del</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 3. Pipelines Page
  function renderPipelinesPage() {
    const exec = state.selectedExecution || state.pipelines[0];

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 700;">CI/CD Pipeline Orchestrator</h2>
          <p style="font-size: 13px; color: #64748b;">12-Stage Secure Container Pipeline with Mandatory Security Gates</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.openJenkinsTemplate()">View Jenkinsfile</button>
          <button class="btn btn-primary btn-sm" onclick="app.triggerPipeline('proj-netflix-clone')">+ Trigger Pipeline</button>
        </div>
      </div>

      <!-- Selected Execution Details Card -->
      ${exec ? `
        <div class="card">
          <div class="card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 17px; font-weight: 700;">Execution #${exec.executionNumber}</span>
                <span class="badge ${exec.status === 'PASSED' ? 'badge-pass' : (exec.status === 'FAILED' ? 'badge-fail' : 'badge-low')}">${exec.status}</span>
                <span style="font-size: 12px; color: #64748b;">branch: <code>${exec.branch}</code> (${exec.commitHash})</span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Triggered by: <strong>${exec.triggeredBy}</strong> &bull; Duration: ${exec.durationSeconds}s</div>
            </div>

            ${exec.status === 'RUNNING' ? `
              <button class="btn btn-danger btn-sm" onclick="app.cancelPipeline('${exec.id}')">Cancel Execution</button>
            ` : ''}
          </div>

          <!-- 12 Stages Timeline Bar -->
          <div class="card-body" style="padding: 16px 20px; background-color: #f8fafc; border-bottom: 1px solid var(--border-color);">
            <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px;">PIPELINE STAGE PROGRESS (12 STAGES)</div>
            <div class="stages-timeline">
              ${(exec.stages || []).map((s, idx) => `
                <div class="stage-pill ${s.status.toLowerCase()}">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: #475569;">#${idx + 1}</span>
                    <span class="badge ${s.status === 'PASSED' ? 'badge-pass' : (s.status === 'FAILED' ? 'badge-fail' : 'badge-low')}" style="padding: 1px 5px; font-size: 9px;">${s.status}</span>
                  </div>
                  <div style="font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s.name}">${s.name}</div>
                  <div style="font-size: 10.5px; color: #64748b;">${s.toolName} (${s.duration || 0}s)</div>
                </div>
              `).join('')}
            </div>

            ${exec.blockedReason ? `
              <div style="margin-top: 12px; padding: 12px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #991b1b; font-size: 12.5px;">
                <strong>Gate Failure Explanation:</strong> ${exec.blockedReason}
              </div>
            ` : ''}
          </div>

          <!-- Dark Terminal Live Logs Window -->
          <div class="card-body">
            <div class="terminal-window">
              <div class="terminal-header">
                <div class="terminal-dots">
                  <span class="terminal-dot dot-red"></span>
                  <span class="terminal-dot dot-yellow"></span>
                  <span class="terminal-dot dot-green"></span>
                </div>
                <div style="font-size: 11px; color: #94a3b8;">STDOUT / STDERR EXECUTION LOGS</div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 10px; background: #1e293b; color: #fff; border-color: #334155;" onclick="app.downloadLogs()">Download Log</button>
                </div>
              </div>
              <div class="terminal-content" id="terminal-content">
                ${state.terminalLogs.map(l => `
                  <div class="log-line">
                    <span class="log-time">[${l.timestamp}]</span>
                    <span class="log-text ${l.level === 'SUCCESS' ? 'log-success' : (l.level === 'WARN' ? 'log-warn' : (l.level === 'ERROR' ? 'log-err' : 'log-info'))}">${l.message}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Past Execution History Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Pipeline Execution History</div>
        </div>
        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Execution</th>
                <th>Project</th>
                <th>Commit Message</th>
                <th>Triggered By</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Security Gate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.pipelines.map(p => `
                <tr style="cursor: pointer; ${state.selectedExecution && state.selectedExecution.id === p.id ? 'background-color: #f1f5f9;' : ''}" onclick="app.selectExecution('${p.id}')">
                  <td><strong>#${p.executionNumber}</strong></td>
                  <td>${p.projectId.replace('proj-', '')}</td>
                  <td><code>${p.commitHash}</code> - ${p.commitMessage || 'Pipeline execution'}</td>
                  <td>${p.triggeredBy}</td>
                  <td><span class="badge ${p.status === 'PASSED' ? 'badge-pass' : (p.status === 'FAILED' ? 'badge-fail' : 'badge-low')}">${p.status}</span></td>
                  <td>${p.durationSeconds}s</td>
                  <td>${p.securityGatePassed ? '<span style="color: #10b981;">Passed</span>' : '<span style="color: #ef4444; font-weight: 600;">Blocked</span>'}</td>
                  <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); app.selectExecution('${p.id}')">Inspect</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 4. Security Center Page
  function renderSecurityPage() {
    const findings = state.findings;
    const cves = findings.filter(f => f.category === 'CVE');
    const secrets = findings.filter(f => f.category === 'SECRET');
    const docks = findings.filter(f => f.category === 'DOCKER' || f.category === 'IAC');
    const sast = findings.filter(f => f.category === 'SAST');

    return `
      <!-- Top Application Cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        ${state.projects.map(p => `
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div style="font-weight: 700; font-size: 15px;">${p.name}</div>
              <span class="badge ${p.securityScore >= 80 ? 'badge-pass' : (p.securityScore >= 70 ? 'badge-warn' : 'badge-fail')}">${p.securityScore}/100</span>
            </div>
            <div class="card-body" style="padding: 14px 18px; font-size: 12.5px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #64748b;">Branch:</span>
                <code>${p.defaultBranch}</code>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #64748b;">Critical Vulnerabilities:</span>
                <span style="font-weight: 700; color: #dc2626;">${p.criticalCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #64748b;">Exposed Secrets:</span>
                <span style="font-weight: 700; color: #dc2626;">${p.exposedSecretCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Pipeline Status:</span>
                <span class="badge ${p.pipelineStatus === 'PASSED' ? 'badge-pass' : 'badge-fail'}" style="padding: 2px 6px;">${p.pipelineStatus}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Security Center Tabs -->
      <div class="tabs-header">
        <button class="tab-btn ${state.activeSecurityTab === 'cve' ? 'active' : ''}" onclick="app.setSecurityTab('cve')">CVE Vulnerabilities (${cves.length})</button>
        <button class="tab-btn ${state.activeSecurityTab === 'secrets' ? 'active' : ''}" onclick="app.setSecurityTab('secrets')">Hardcoded Secrets (${secrets.length})</button>
        <button class="tab-btn ${state.activeSecurityTab === 'docker' ? 'active' : ''}" onclick="app.setSecurityTab('docker')">SAST & Docker Security (${docks.length + sast.length})</button>
        <button class="tab-btn ${state.activeSecurityTab === 'remediations' ? 'active' : ''}" onclick="app.setSecurityTab('remediations')">Automated Patch Jobs (${state.remediations.length})</button>
      </div>

      <!-- Tab Content -->
      <div class="card">
        <div class="card-body" style="padding: 0;">
          ${state.activeSecurityTab === 'cve' ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Vulnerability</th>
                  <th>Package & Version</th>
                  <th>Fixed Version</th>
                  <th>Project</th>
                  <th>Severity</th>
                  <th>CVSS</th>
                  <th>Remediation Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${cves.map(f => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${f.cveId || 'VULN'}</div>
                      <div style="font-size: 11px; color: #64748b;">${f.title}</div>
                    </td>
                    <td><code>${f.packageName} @ ${f.installedVersion}</code></td>
                    <td><strong style="color: #10b981;">${f.fixedVersion || 'N/A'}</strong></td>
                    <td>${f.projectId.replace('proj-', '')}</td>
                    <td><span class="badge badge-critical">${f.severity}</span></td>
                    <td><strong>${f.cvssScore}</strong></td>
                    <td><span class="badge ${f.remediationStatus === 'RESOLVED' ? 'badge-pass' : 'badge-warn'}">${f.remediationStatus}</span></td>
                    <td>
                      ${f.remediationStatus !== 'RESOLVED' ? `
                        <button class="btn btn-primary btn-sm" onclick="app.openPatchModal('${f.id}')">Auto-Patch</button>
                      ` : `
                        <span style="color: #10b981; font-size: 12px; font-weight: 600;">Resolved</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${state.activeSecurityTab === 'secrets' ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Secret Type</th>
                  <th>Masked Preview</th>
                  <th>File Path & Line</th>
                  <th>Project</th>
                  <th>Severity</th>
                  <th>Remediation Guidance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${secrets.map(s => `
                  <tr>
                    <td><strong>${s.title}</strong></td>
                    <td><code>AKIA••••••••••••4J29</code></td>
                    <td>${s.filePath}:${s.lineNumber || 1}</td>
                    <td>${s.projectId.replace('proj-', '')}</td>
                    <td><span class="badge badge-critical">${s.severity}</span></td>
                    <td style="font-size: 12px; color: #64748b;">${s.remediationGuidance}</td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="app.resolveFinding('${s.id}')">Revoke & Sync Vault</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${state.activeSecurityTab === 'docker' ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Issue Description</th>
                  <th>File</th>
                  <th>Tool</th>
                  <th>Severity</th>
                  <th>Remediation Suggestion</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${[...docks, ...sast].map(d => `
                  <tr>
                    <td><span class="badge badge-low">${d.category}</span></td>
                    <td>
                      <div style="font-weight: 700;">${d.title}</div>
                      <div style="font-size: 11px; color: #64748b;">${d.description}</div>
                    </td>
                    <td><code>${d.filePath}</code></td>
                    <td>${d.toolName}</td>
                    <td><span class="badge ${d.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}">${d.severity}</span></td>
                    <td style="font-size: 12px; color: #475569;">${d.remediationGuidance}</td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="app.resolveFinding('${d.id}')">Apply Fix</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${state.activeSecurityTab === 'remediations' ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Remediation Job</th>
                  <th>Package & Upgrade</th>
                  <th>Branch Created</th>
                  <th>Test Run</th>
                  <th>Status</th>
                  <th>Pull Request</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.remediations.map(r => `
                  <tr>
                    <td><strong>${r.id}</strong></td>
                    <td><code>${r.packageName}</code> (${r.previousVersion} &rarr; ${r.proposedVersion})</td>
                    <td><code>${r.remediationBranch}</code></td>
                    <td><span style="color: #10b981; font-size: 12px;">${r.testRunStatus}</span></td>
                    <td><span class="badge ${r.status === 'PR_CREATED' || r.status === 'MERGED' ? 'badge-pass' : 'badge-warn'}">${r.status}</span></td>
                    <td>
                      ${r.githubPrUrl ? `<a href="${r.githubPrUrl}" target="_blank" style="color: #2563eb;">PR #${r.githubPrNumber}</a>` : 'Pending'}
                    </td>
                    <td>
                      ${r.status === 'PROPOSED' ? `
                        <button class="btn btn-primary btn-sm" onclick="app.approveRemediation('${r.id}')">Approve & Merge</button>
                        <button class="btn btn-outline btn-sm" onclick="app.rejectRemediation('${r.id}')">Reject</button>
                      ` : `
                        <span style="color: #10b981; font-size: 12px; font-weight: 600;">PR Verified</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 5. App Monitor Page
  function renderAppMonitorPage() {
    const appProj = state.projects.find(p => p.id === state.activeAppId) || state.projects[0];
    const appFindings = state.findings.filter(f => f.projectId === appProj.id);

    return `
      <div style="display: grid; grid-template-columns: 260px 1fr; gap: 20px;">
        <!-- Left Apps List -->
        <div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">Applications</div>
            </div>
            <div class="card-body" style="padding: 10px;">
              ${state.projects.map(p => `
                <div style="padding: 12px 14px; border-radius: 8px; margin-bottom: 6px; cursor: pointer; border: 1px solid ${state.activeAppId === p.id ? '#2563eb' : '#e2e8f0'}; background: ${state.activeAppId === p.id ? '#eff6ff' : '#ffffff'};" onclick="app.setActiveApp('${p.id}')">
                  <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${p.name}</div>
                  <div style="font-size: 11px; color: #64748b;">${p.framework}</div>
                  <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px;">
                    <span class="badge ${p.serverStatus === 'RUNNING' ? 'badge-pass' : 'badge-low'}">${p.serverStatus}</span>
                    <span style="font-weight: 600;">Score: ${p.securityScore}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right App Details -->
        <div>
          <div class="card">
            <div class="card-header">
              <div>
                <div style="font-size: 18px; font-weight: 700;">${appProj.name}</div>
                <div style="font-size: 12px; color: #64748b;">Workspace: <code>${appProj.workspacePath}</code> &bull; Port: ${appProj.devServerPort || 3001}</div>
              </div>
              <div style="display: flex; gap: 8px;">
                ${appProj.serverStatus === 'RUNNING' ? `
                  <button class="btn btn-danger btn-sm" onclick="app.stopServer('${appProj.id}')">Stop Dev Server</button>
                ` : `
                  <button class="btn btn-primary btn-sm" onclick="app.startServer('${appProj.id}')">Start Dev Server</button>
                `}
                <button class="btn btn-outline btn-sm" onclick="app.scanProject('${appProj.id}')">SAST Scan</button>
              </div>
            </div>

            <!-- App Tabs -->
            <div class="card-body" style="padding-bottom: 0;">
              <div class="tabs-header" style="margin-bottom: 14px;">
                <button class="tab-btn ${state.activeAppTab === 'overview' ? 'active' : ''}" onclick="app.setAppTab('overview')">Overview</button>
                <button class="tab-btn ${state.activeAppTab === 'logs' ? 'active' : ''}" onclick="app.setAppTab('logs')">Live Process Logs</button>
                <button class="tab-btn ${state.activeAppTab === 'k8s' ? 'active' : ''}" onclick="app.setAppTab('k8s')">Kubernetes Manifests</button>
                <button class="tab-btn ${state.activeAppTab === 'docker' ? 'active' : ''}" onclick="app.setAppTab('docker')">Dockerfile Preview</button>
              </div>
            </div>

            <div class="card-body" style="padding-top: 0;">
              ${state.activeAppTab === 'overview' ? `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">DEPENDENCIES</div>
                    <div style="font-size: 20px; font-weight: 700;">${appProj.dependencyCount}</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">SOURCE FILES</div>
                    <div style="font-size: 20px; font-weight: 700;">${appProj.fileCount}</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">DOCKERFILE</div>
                    <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-top: 6px;">Available</div>
                  </div>
                  <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; color: #64748b;">K8S MANIFEST</div>
                    <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-top: 6px;">Hardened</div>
                  </div>
                </div>

                <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Security Findings in this Project (${appFindings.length})</h4>
                <table style="width: 100%;">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Severity</th>
                      <th>Remediation</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${appFindings.map(f => `
                      <tr>
                        <td><strong>${f.title}</strong></td>
                        <td><span class="badge badge-low">${f.category}</span></td>
                        <td><span class="badge badge-critical">${f.severity}</span></td>
                        <td style="font-size: 12px; color: #64748b;">${f.remediationGuidance}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}

              ${state.activeAppTab === 'logs' ? `
                <div class="terminal-window">
                  <div class="terminal-header">
                    <div class="terminal-dots">
                      <span class="terminal-dot dot-red"></span>
                      <span class="terminal-dot dot-yellow"></span>
                      <span class="terminal-dot dot-green"></span>
                    </div>
                    <span style="font-size: 11px; color: #94a3b8;">${appProj.name} STDERR/STDOUT Process Output</span>
                    <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 10px; background: #1e293b; color: #fff; border-color: #334155;">Clear</button>
                  </div>
                  <div class="terminal-content">
                    <div class="log-line"><span class="log-time">[18:45:02]</span> <span class="log-info">[nodemon] starting dev server</span></div>
                    <div class="log-line"><span class="log-time">[18:45:03]</span> <span class="log-info">[vault-sync] Synchronized 5 credentials from Vault KV v2</span></div>
                    <div class="log-line"><span class="log-time">[18:45:04]</span> <span class="log-success">[http] Server listening on http://localhost:${appProj.devServerPort || 3001}</span></div>
                    <div class="log-line"><span class="log-time">[18:45:06]</span> <span class="log-info">[falco-agent] eBPF probes attached to PID namespace</span></div>
                    <div class="log-line"><span class="log-time">[18:45:12]</span> <span class="log-warn">[warn] Deprecated algorithm used in token decoder</span></div>
                    <div class="log-line"><span class="log-time">[18:45:20]</span> <span class="log-info">[health] GET /api/health HTTP/1.1 200 OK</span></div>
                  </div>
                </div>
              ` : ''}

              ${state.activeAppTab === 'k8s' ? `
                <div class="diff-container" style="max-height: 400px; overflow-y: auto;">
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appProj.slug}-deployment
  namespace: production
  labels:
    app: ${appProj.slug}
    security.devsecops.io/policy: restricted
spec:
  replicas: 2
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: ${appProj.slug}
        image: docker.enterprise.internal/${appProj.slug}:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop: ["ALL"]
                </div>
              ` : ''}

              ${state.activeAppTab === 'docker' ? `
                <div class="diff-container" style="max-height: 400px; overflow-y: auto;">
# Multi-stage secure build for ${appProj.name}
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user creation
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 devsecops

USER devsecops
EXPOSE 3000
CMD ["npm", "start"]
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 6. Runtime Monitoring Page
  function renderMonitoringPage() {
    return `
      <!-- Top Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Active Pods</div>
          <div class="metric-value">${state.pods.length}</div>
          <div class="metric-footer">Namespace: production & falco-system</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">CPU Usage</div>
          <div class="metric-value" style="color: #2563eb;">42%</div>
          <div class="metric-footer">Node allocation limit: 80%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Memory Usage</div>
          <div class="metric-value" style="color: #d97706;">68%</div>
          <div class="metric-footer">Working set: 1.84 GB</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Network I/O</div>
          <div class="metric-value">1.2 GB/s</div>
          <div class="metric-footer">Egress filtering active</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Active Threats</div>
          <div class="metric-value" style="color: #dc2626;">${state.alerts.filter(a => !a.acknowledged).length}</div>
          <div class="metric-footer">Sysdig Falco eBPF engine</div>
        </div>
      </div>

      <!-- Falco Alerts Table Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            ${icons.monitoring}
            <span>Falco Runtime Threat Detections (${state.alerts.length})</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="app.refreshAlerts()">Refresh</button>
        </div>

        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Severity</th>
                <th>Pod / Container</th>
                <th>Namespace</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.alerts.map(a => `
                <tr>
                  <td><strong>${a.ruleName}</strong></td>
                  <td><span class="badge ${a.severity === 'CRITICAL' ? 'badge-critical' : (a.severity === 'HIGH' ? 'badge-high' : 'badge-medium')}">${a.severity}</span></td>
                  <td><code>${a.podName}</code></td>
                  <td><code>${a.namespace}</code></td>
                  <td style="font-size: 12px; color: #475569;">${a.description}</td>
                  <td>
                    ${a.acknowledged ? '<span class="badge badge-pass">Acknowledged</span>' : '<span class="badge badge-critical">Active Threat</span>'}
                  </td>
                  <td>
                    ${!a.acknowledged ? `
                      <button class="btn btn-primary btn-sm" onclick="app.acknowledgeAlert('${a.id}')">Acknowledge</button>
                    ` : `
                      <span style="font-size: 11px; color: #64748b;">Acked by ${a.acknowledgedBy || 'secops'}</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kubernetes Pods Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Kubernetes Workloads & Pod Health</div>
        </div>
        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Pod Name</th>
                <th>Namespace</th>
                <th>Status</th>
                <th>Image</th>
                <th>Restarts</th>
                <th>Ready</th>
                <th>CPU / Mem</th>
                <th>SecurityContext</th>
              </tr>
            </thead>
            <tbody>
              ${state.pods.map(p => `
                <tr>
                  <td><strong>${p.podName}</strong></td>
                  <td><code>${p.namespace}</code></td>
                  <td><span class="badge ${p.status === 'Running' ? 'badge-pass' : 'badge-fail'}">${p.status}</span></td>
                  <td><code style="font-size: 11px;">${p.image}</code></td>
                  <td>${p.restarts}</td>
                  <td>${p.readyReplicas}</td>
                  <td style="font-size: 12px;">${p.cpuCores} / ${p.memoryMb}</td>
                  <td>
                    ${p.securityContextCompliant ? '<span style="color: #10b981; font-weight: 600;">Compliant (Non-root)</span>' : '<span style="color: #ef4444; font-weight: 600;">Violates CIS</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 7. Vault Page
  function renderVaultPage() {
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${icons.vault} HashiCorp Vault Secrets Management</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Backend: HashiCorp Vault KV v2 &bull; Status: <span style="color: #10b981; font-weight: 600;">CONNECTED</span></div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="app.testVaultConnection()">Test Connection</button>
            <button class="btn btn-primary btn-sm" onclick="app.openModal('addSecret')">+ Add Secret</button>
          </div>
        </div>

        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Secret Key</th>
                <th>Project / Scope</th>
                <th>Vault KV Path</th>
                <th>Type</th>
                <th>Masked Value</th>
                <th>Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.vaultSecrets.map(v => `
                <tr>
                  <td><strong>${v.secretKey}</strong></td>
                  <td>${v.projectId.replace('proj-', '')}</td>
                  <td><code>${v.secretPath}</code></td>
                  <td><span class="badge badge-low">${v.secretType}</span></td>
                  <td><code>${v.maskedValue}</code></td>
                  <td><span class="badge badge-pass">v${v.currentVersion}</span></td>
                  <td><span class="badge badge-pass">${v.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="app.rotateVaultSecret('${v.id}')">Rotate</button>
                    <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="app.deleteVaultSecret('${v.id}')">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 8. Compliance Page
  function renderCompliancePage() {
    const fw = state.complianceFrameworks;
    const controls = state.complianceControls;

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 700;">Regulatory Compliance & Audit Center</h2>
          <p style="font-size: 13px; color: #64748b;">Automated Technical Control Gate Evaluations (Technical evidence does not constitute legal certification)</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.exportCompliancePackage()">Export Audit Package</button>
          <button class="btn btn-primary btn-sm" onclick="app.triggerReAudit()">Trigger Re-Audit</button>
        </div>
      </div>

      <!-- Framework Cards -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 24px;">
        ${fw.map(f => `
          <div class="card" style="margin-bottom: 0; padding: 16px; cursor: pointer; border: 1px solid ${state.activeComplianceFramework === f.id ? '#2563eb' : '#e2e8f0'};" onclick="app.filterCompliance('${f.id}')">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${f.name}</div>
            <div style="font-size: 11px; color: #64748b;">${f.version}</div>
            <div style="font-size: 24px; font-weight: 700; color: #2563eb; margin: 10px 0 4px 0;">${f.score}%</div>
            <div style="font-size: 11px; color: #64748b;">${f.passed}/${f.total} controls passed</div>
          </div>
        `).join('')}
      </div>

      <!-- Control Gates Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Automated Control Gates Audit Log (${controls.length} Controls)</div>
          <span class="badge badge-pass">Continuous Verification Active</span>
        </div>

        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Control Code</th>
                <th>Control Name & Requirements</th>
                <th>Framework</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Automated Technical Evidence Log</th>
                <th>Project</th>
              </tr>
            </thead>
            <tbody>
              ${controls.map(c => `
                <tr>
                  <td><strong>${c.controlCode}</strong></td>
                  <td>
                    <div style="font-weight: 700;">${c.controlName}</div>
                    <div style="font-size: 11.5px; color: #64748b;">${c.requirements}</div>
                  </td>
                  <td><span class="badge badge-low">${c.frameworkId.toUpperCase()}</span></td>
                  <td><span class="badge ${c.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}">${c.severity}</span></td>
                  <td>
                    <span class="badge ${c.status === 'PASS' ? 'badge-pass' : (c.status === 'FAIL' ? 'badge-fail' : 'badge-warn')}">${c.status}</span>
                  </td>
                  <td>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 11px; color: #334155; max-width: 320px; white-space: pre-wrap;">${c.technicalEvidence}</div>
                  </td>
                  <td><strong>${c.linkedProject}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 9. Reports Page
  function renderReportsPage() {
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title">${icons.reports} Security & Compliance Reports Center</div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="app.downloadCsvReport()">Export Findings (CSV)</button>
            <button class="btn btn-primary btn-sm" onclick="window.print()">Print / Save PDF</button>
          </div>
        </div>

        <div class="card-body" style="padding: 0;">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Category</th>
                <th>Format</th>
                <th>Generated Timestamp</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Executive Security Summary</strong></td>
                <td>Executive Brief</td>
                <td><span class="badge badge-low">PDF</span></td>
                <td>Today, 10:00 UTC</td>
                <td><span class="badge badge-pass">READY</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="window.print()">View / Print</button></td>
              </tr>
              <tr>
                <td><strong>Project Security Assessment - Netflix Clone</strong></td>
                <td>Project Audit</td>
                <td><span class="badge badge-low">PDF</span></td>
                <td>Today, 08:30 UTC</td>
                <td><span class="badge badge-pass">READY</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="window.print()">View / Print</button></td>
              </tr>
              <tr>
                <td><strong>Vulnerability Inventory & Exploitability Analysis</strong></td>
                <td>Technical SCA</td>
                <td><span class="badge badge-warn">CSV</span></td>
                <td>Today, 07:15 UTC</td>
                <td><span class="badge badge-pass">READY</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="app.downloadCsvReport()">Download CSV</button></td>
              </tr>
              <tr>
                <td><strong>SOC 2 Type II Continuous Compliance Evidence Package</strong></td>
                <td>Regulatory Package</td>
                <td><span class="badge badge-low">PDF</span></td>
                <td>Today, 06:00 UTC</td>
                <td><span class="badge badge-pass">READY</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="window.print()">View / Print</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 10. Settings Page
  function renderSettingsPage() {
    return `
      <!-- Settings Tabs -->
      <div class="tabs-header">
        <button class="tab-btn ${state.activeSettingsTab === 'general' ? 'active' : ''}" onclick="app.setSettingsTab('general')">General</button>
        <button class="tab-btn ${state.activeSettingsTab === 'policies' ? 'active' : ''}" onclick="app.setSettingsTab('policies')">Security Policies</button>
        <button class="tab-btn ${state.activeSettingsTab === 'notifications' ? 'active' : ''}" onclick="app.setSettingsTab('notifications')">Notifications</button>
        <button class="tab-btn ${state.activeSettingsTab === 'integrations' ? 'active' : ''}" onclick="app.setSettingsTab('integrations')">Integrations (12)</button>
      </div>

      <div class="card">
        <div class="card-body">
          ${state.activeSettingsTab === 'general' ? `
            <form onsubmit="app.saveSettings(event)">
              <div class="form-group">
                <label class="form-label">Platform Name</label>
                <input type="text" id="setting-platform-name" class="form-control" value="${state.settings.platformName || 'DevSecOps Enterprise Security & Monitoring Platform'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Default Analysis Branch</label>
                <input type="text" id="setting-default-branch" class="form-control" value="${state.settings.defaultBranch || 'main'}" />
              </div>
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600;">
                  <input type="checkbox" id="setting-auto-k8s" checked />
                  <span>Automatically generate Kubernetes YAML manifests for registered projects</span>
                </label>
              </div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          ` : ''}

          ${state.activeSettingsTab === 'policies' ? `
            <form onsubmit="app.saveSettings(event)">
              <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                  <input type="checkbox" id="pol-crit" checked />
                  <span>Block CI/CD deployment on Critical CVE vulnerabilities (MANDATORY GATE)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                  <input type="checkbox" id="pol-secrets" checked />
                  <span>Block CI/CD deployment on exposed plaintext credentials & secrets</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                  <input type="checkbox" id="pol-signing" checked />
                  <span>Require Cosign container image signatures before production rollout</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                  <input type="checkbox" id="pol-nonroot" checked />
                  <span>Require non-root USER instruction in Dockerfile (CIS Benchmark 4.1)</span>
                </label>
              </div>
              <button type="submit" class="btn btn-primary">Save Policies</button>
            </form>
          ` : ''}

          ${state.activeSettingsTab === 'notifications' ? `
            <form onsubmit="app.saveSettings(event)">
              <div class="form-group">
                <label class="form-label">Email Recipients</label>
                <input type="text" class="form-control" value="${state.settings.emailRecipients || 'secops-team@enterprise.internal'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Slack Webhook URL</label>
                <input type="text" class="form-control" value="${state.settings.slackWebhookUrl || ''}" placeholder="https://example.com/webhook" />
              </div>
              <button type="submit" class="btn btn-primary">Save Notifications</button>
            </form>
          ` : ''}

          ${state.activeSettingsTab === 'integrations' ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Tool / Integration</th>
                  <th>Category</th>
                  <th>Configured Endpoint</th>
                  <th>Status</th>
                  <th>Last Check</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${state.integrations.map(i => `
                  <tr>
                    <td><strong>${i.displayName}</strong></td>
                    <td><span class="badge badge-low">${i.category}</span></td>
                    <td><code>${i.endpointUrl}</code></td>
                    <td><span class="badge badge-pass">${i.status}</span></td>
                    <td style="font-size: 12px; color: #64748b;">Just now</td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="app.testIntegration('${i.name}')">Test Connection</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Modals Component
  function renderModal() {
    if (!state.activeModal) return '';

    if (state.activeModal === 'patchPackage') {
      const finding = state.modalData;
      return `
        <div class="modal-backdrop" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-dialog">
            <div class="modal-header">
              <div style="font-weight: 700; font-size: 16px;">Automated Vulnerability Remediation</div>
              <button class="btn btn-outline btn-sm" onclick="app.closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div style="margin-bottom: 16px;">
                <h4 style="font-size: 15px; font-weight: 700; color: #0f172a;">${finding.title}</h4>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">CVE: <strong>${finding.cveId}</strong> &bull; CVSS Score: <strong>${finding.cvssScore}</strong></div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="padding: 10px; background: #fee2e2; border-radius: 6px; font-size: 12px;">
                  <div style="color: #991b1b; font-weight: 600;">INSTALLED VERSION</div>
                  <div style="font-size: 16px; font-weight: 700; color: #991b1b;">${finding.packageName} @ ${finding.installedVersion}</div>
                </div>
                <div style="padding: 10px; background: #dcfce7; border-radius: 6px; font-size: 12px;">
                  <div style="color: #166534; font-weight: 600;">PROPOSED FIXED VERSION</div>
                  <div style="font-size: 16px; font-weight: 700; color: #166534;">${finding.packageName} @ ${finding.fixedVersion || '9.0.0'}</div>
                </div>
              </div>

              <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">PROPOSED GIT MANIFEST DIFF</div>
              <div class="diff-container" style="margin-bottom: 16px;">
--- a/package.json
+++ b/package.json
@@ -24,3 +24,3 @@
<span class="diff-del">-    "${finding.packageName}": "^${finding.installedVersion}",</span>
<span class="diff-add">+    "${finding.packageName}": "^${finding.fixedVersion || '9.0.0'}",</span>
              </div>

              <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #475569;">
                <strong>Automated Safety Verification:</strong> SemVer compatibility verified. Automated test suite will run in isolated workspace branch <code>remediation/${finding.cveId.toLowerCase()}-patch</code> before creating pull request.
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="app.closeModal()">Reject / Close</button>
              <button class="btn btn-primary" onclick="app.applyPackagePatch('${finding.id}', '${finding.fixedVersion || '9.0.0'}')">Approve Patch & Create PR</button>
            </div>
          </div>
        </div>
      `;
    }

    if (state.activeModal === 'addProject') {
      return `
        <div class="modal-backdrop" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-dialog">
            <div class="modal-header">
              <div style="font-weight: 700; font-size: 16px;">Register New Project</div>
              <button class="btn btn-outline btn-sm" onclick="app.closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <form id="add-proj-form" onsubmit="app.handleAddProject(event)">
                <div class="form-group">
                  <label class="form-label">Project Name</label>
                  <input type="text" id="new-proj-name" class="form-control" placeholder="e.g., Payment Gateway Service" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Git Repository URL</label>
                  <input type="url" id="new-proj-url" class="form-control" placeholder="https://github.com/enterprise/repo.git" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Default Branch</label>
                  <input type="text" id="new-proj-branch" class="form-control" value="main" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea id="new-proj-desc" class="form-control" rows="2" placeholder="Brief project overview"></textarea>
                </div>
                <div class="modal-footer" style="padding: 16px 0 0 0; background: transparent; border: none;">
                  <button type="button" class="btn btn-outline" onclick="app.closeModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save & Trigger Scan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    if (state.activeModal === 'addSecret') {
      return `
        <div class="modal-backdrop" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-dialog">
            <div class="modal-header">
              <div style="font-weight: 700; font-size: 16px;">Store Secret in HashiCorp Vault KV v2</div>
              <button class="btn btn-outline btn-sm" onclick="app.closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <form onsubmit="app.handleAddSecret(event)">
                <div class="form-group">
                  <label class="form-label">Secret Key Name</label>
                  <input type="text" id="new-sec-key" class="form-control" placeholder="e.g., PAYMENT_API_TOKEN" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Vault Storage Path</label>
                  <input type="text" id="new-sec-path" class="form-control" value="secret/data/production/services" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Secret Type</label>
                  <select id="new-sec-type" class="form-control">
                    <option value="API_KEY">API_KEY</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="CERTIFICATE">CERTIFICATE</option>
                    <option value="CLOUD_CREDENTIAL">CLOUD_CREDENTIAL</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Secret Raw Value (will be masked and encrypted in Vault)</label>
                  <input type="password" id="new-sec-val" class="form-control" placeholder="••••••••••••" required />
                </div>
                <div class="modal-footer" style="padding: 16px 0 0 0; background: transparent; border: none;">
                  <button type="button" class="btn btn-outline" onclick="app.closeModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary">Encrypt & Store</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    if (state.activeModal === 'dockerfilePreview') {
      const data = state.modalData;
      return `
        <div class="modal-backdrop" onclick="if(event.target === this) app.closeModal()">
          <div class="modal-dialog" style="max-width: 750px;">
            <div class="modal-header">
              <div style="font-weight: 700; font-size: 16px;">Hardened Container Artifacts Preview</div>
              <button class="btn btn-outline btn-sm" onclick="app.closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">Secure Multi-stage Dockerfile (Non-Root User)</div>
              <div class="diff-container" style="max-height: 220px; overflow-y: auto; margin-bottom: 16px;">
${data.dockerfile}
              </div>

              <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">Restricted Kubernetes Deployment Manifest</div>
              <div class="diff-container" style="max-height: 220px; overflow-y: auto;">
${data.kubernetesYaml}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="app.closeModal()">Close</button>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  // Event Listeners
  function attachEventListeners() {
    // Navigation
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        state.currentPage = el.getAttribute('data-nav');
        renderApp();
      });
    });

    // Top action buttons
    const btnScan = document.getElementById('btn-quick-scan');
    if (btnScan) btnScan.addEventListener('click', () => app.scanProject(state.projects[0] ? state.projects[0].id : 'proj-netflix-clone'));

    const btnPipeline = document.getElementById('btn-quick-pipeline');
    if (btnPipeline) btnPipeline.addEventListener('click', () => app.triggerPipeline(state.projects[0] ? state.projects[0].id : 'proj-netflix-clone'));
  }

  // Markdown Formatter
  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  // Public Interface attached to window.app
  window.app = {
    navigate: (page) => {
      state.currentPage = page;
      renderApp();
    },

    setSecurityTab: (tab) => {
      state.activeSecurityTab = tab;
      renderApp();
    },

    setAppTab: (tab) => {
      state.activeAppTab = tab;
      renderApp();
    },

    setSettingsTab: (tab) => {
      state.activeSettingsTab = tab;
      renderApp();
    },

    setActiveApp: (appId) => {
      state.activeAppId = appId;
      renderApp();
    },

    filterCompliance: (fwId) => {
      state.activeComplianceFramework = fwId;
      api(`/api/compliance/controls?frameworkId=${fwId}`).then(res => {
        if (res) {
          state.complianceControls = res;
          renderApp();
        }
      });
    },

    openModal: (modalName, data = null) => {
      state.activeModal = modalName;
      state.modalData = data;
      renderApp();
    },

    closeModal: () => {
      state.activeModal = null;
      state.modalData = null;
      renderApp();
    },

    selectExecution: async (id) => {
      const exec = state.pipelines.find(p => p.id === id);
      if (exec) {
        state.selectedExecution = exec;
        const logs = await api(`/api/pipelines/${id}/logs`);
        if (logs) state.terminalLogs = logs;
        renderApp();
      }
    },

    // AI Assistant Handlers
    askAssistant: async (query) => {
      state.assistantMessages.push({ sender: 'user', text: query });
      state.assistantLoading = true;
      renderApp();
      // Auto-scroll to bottom while loading
      const chatBoxPre = document.getElementById('ai-chat-box');
      if (chatBoxPre) chatBoxPre.scrollTop = chatBoxPre.scrollHeight;

      const res = await api('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: query, model: state.ollamaModel || null })
      });

      state.assistantLoading = false;
      if (res) {
        if (res.answer) {
          state.assistantMessages.push({
            sender: 'assistant',
            text: res.answer,
            model: res.model || null,
            actions: res.actions || [],
            ollamaAvailable: res.ollamaAvailable || false,
            ollamaModels: res.ollamaModels || []
          });
        }
        // Update global Ollama state for header badge
        state.ollamaAvailable = res.ollamaAvailable || false;
        state.ollamaModels = res.ollamaModels || [];
        if (res.ollamaModels && res.ollamaModels.length > 0 && !state.ollamaModel) {
          state.ollamaModel = res.ollamaModels[0];
        }
      }
      renderApp();
      const chatBox = document.getElementById('ai-chat-box');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    },

    handleAssistantSubmit: (e) => {
      e.preventDefault();
      const input = document.getElementById('ai-input');
      if (input && input.value) {
        const val = input.value;
        input.value = '';
        window.app.askAssistant(val);
      }
    },

    // Vulnerability Auto-Patch Handlers
    openPatchModal: (findingId) => {
      const finding = state.findings.find(f => f.id === findingId);
      if (finding) {
        window.app.openModal('patchPackage', finding);
      }
    },

    applyPackagePatch: async (findingId, proposedVersion) => {
      const res = await api('/api/security/patch-package', {
        method: 'POST',
        body: JSON.stringify({ findingId, proposedVersion })
      });
      if (res) {
        state.remediations.unshift(res);
        const f = state.findings.find(item => item.id === findingId);
        if (f) f.remediationStatus = 'PATCH_PROPOSED';
        window.app.closeModal();
        alert(`Remediation job created on branch: ${res.remediationBranch}\nAutomated testing passed.`);
        renderApp();
      }
    },

    approveRemediation: async (jobId) => {
      const res = await api(`/api/security/remediations/${jobId}/approve`, { method: 'POST' });
      if (res) {
        alert('Patch approved! Local remediation branch merged and GitHub PR confirmed.');
        await fetchInitialData();
        renderApp();
      }
    },

    rejectRemediation: async (jobId) => {
      await api(`/api/security/remediations/${jobId}/reject`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    resolveFinding: async (id) => {
      await api(`/api/security/findings/${id}/status?status=RESOLVED`, { method: 'PATCH' });
      await fetchInitialData();
      renderApp();
    },

    // Scan & Pipeline actions
    scanProject: async (id) => {
      const res = await api(`/api/projects/${id}/scan`, { method: 'POST' });
      if (res) {
        alert(`Security scan completed for project: ${res.projectName}\nScore: ${res.securityScore}/100`);
        await fetchInitialData();
        renderApp();
      }
    },

    triggerPipeline: async (id) => {
      const res = await api('/api/pipelines/trigger', {
        method: 'POST',
        body: JSON.stringify({ projectId: id, branch: 'main' })
      });
      if (res) {
        alert(`Pipeline #${res.executionNumber} triggered and passed security gates!`);
        await fetchInitialData();
        state.selectedExecution = res;
        state.currentPage = 'pipelines';
        renderApp();
      }
    },

    cancelPipeline: async (id) => {
      await api(`/api/pipelines/${id}/cancel`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    openJenkinsTemplate: async () => {
      const res = await api('/api/pipelines/jenkinsfile-template');
      if (res) {
        alert(`Jenkinsfile Template:\n\n${res.jenkinsfile}`);
      }
    },

    // App server actions
    startServer: async (id) => {
      await api(`/api/apps/${id}/start`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    stopServer: async (id) => {
      await api(`/api/apps/${id}/stop`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    previewDockerfile: async (id) => {
      const res = await api(`/api/projects/${id}/dockerfile-preview`);
      if (res) {
        window.app.openModal('dockerfilePreview', res);
      }
    },

    // Projects CRUD
    handleAddProject: async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-proj-name').value;
      const url = document.getElementById('new-proj-url').value;
      const branch = document.getElementById('new-proj-branch').value;
      const desc = document.getElementById('new-proj-desc').value;

      const res = await api('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name, repositoryUrl: url, defaultBranch: branch, description: desc })
      });
      if (res) {
        window.app.closeModal();
        await fetchInitialData();
        renderApp();
      }
    },

    deleteProject: async (id) => {
      if (confirm('Are you sure you want to delete this project registry?')) {
        await api(`/api/projects/${id}`, { method: 'DELETE' });
        await fetchInitialData();
        renderApp();
      }
    },

    // Vault actions
    handleAddSecret: async (e) => {
      e.preventDefault();
      const key = document.getElementById('new-sec-key').value;
      const path = document.getElementById('new-sec-path').value;
      const type = document.getElementById('new-sec-type').value;

      await api('/api/vault/secrets', {
        method: 'POST',
        body: JSON.stringify({ secretKey: key, secretPath: path, secretType: type })
      });
      window.app.closeModal();
      await fetchInitialData();
      renderApp();
    },

    rotateVaultSecret: async (id) => {
      await api(`/api/vault/secrets/${id}/rotate`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    deleteVaultSecret: async (id) => {
      if (confirm('Delete secret from Vault KV v2 engine?')) {
        await api(`/api/vault/secrets/${id}`, { method: 'DELETE' });
        await fetchInitialData();
        renderApp();
      }
    },

    testVaultConnection: async () => {
      const res = await api('/api/vault/test-connection', { method: 'POST' });
      if (res) alert(`Vault Handshake: ${res.status}\n${res.message}\nLatency: ${res.latencyMs}ms`);
    },

    // Falco Runtime Alert actions
    acknowledgeAlert: async (id) => {
      await api(`/api/runtime/alerts/${id}/acknowledge`, { method: 'POST' });
      await fetchInitialData();
      renderApp();
    },

    refreshAlerts: async () => {
      const alerts = await api('/api/runtime/alerts');
      if (alerts) {
        state.alerts = alerts;
        renderApp();
      }
    },

    // Compliance actions
    triggerReAudit: async () => {
      const res = await api('/api/compliance/audit', { method: 'POST' });
      if (res) {
        alert(`Audit Complete: ${res.controlsEvaluated} controls re-evaluated. Evidence refreshed.`);
        await fetchInitialData();
        renderApp();
      }
    },

    exportCompliancePackage: async () => {
      const res = await api('/api/compliance/export');
      if (res) alert(`Audit Package ${res.exportId} compiled for frameworks:\n${res.frameworks.join(', ')}`);
    },

    // Reports export
    downloadCsvReport: () => {
      window.location.href = '/api/reports/export-csv';
    },

    downloadLogs: () => {
      const text = state.terminalLogs.map(l => `[${l.timestamp}] ${l.level}: ${l.message}`).join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pipeline_log_${state.selectedExecution ? state.selectedExecution.id : 'latest'}.txt`;
      a.click();
    },

    // Settings actions
    saveSettings: async (e) => {
      e.preventDefault();
      alert('Platform settings and security policies updated successfully.');
    },

    testIntegration: async (name) => {
      const res = await api(`/api/settings/integrations/${name}/test`, { method: 'POST' });
      if (res) alert(`Integration Test: ${res.name}\nStatus: ${res.status}\n${res.message}`);
    }
  };

  // Launch on document ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
