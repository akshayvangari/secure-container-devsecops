import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Project, SecurityFinding, PipelineExecution } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sum, projs] = await Promise.all([
          api.getDashboardSummary(),
          api.getProjects()
        ]);
        setSummary(sum);
        setProjects(projs);
      } catch (err) {
        console.error('Failed to load platform data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 border-r border-slate-800">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            🛡️
          </div>
          <div>
            <div className="text-white font-bold text-base">DevSecOps</div>
            <div className="text-xs uppercase text-slate-400">Enterprise 2.0</div>
          </div>
        </div>

        <nav className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'projects', label: 'Projects' },
            { id: 'pipelines', label: 'Pipelines' },
            { id: 'security', label: 'Security Center' },
            { id: 'apps', label: 'App Monitor' },
            { id: 'monitoring', label: 'Runtime Monitoring' },
            { id: 'vault', label: 'Vault' },
            { id: 'compliance', label: 'Compliance & Audit' },
            { id: 'reports', label: 'Reports' },
            { id: 'settings', label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold capitalize">{currentPage.replace('-', ' ')}</h1>
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
              Cluster Guard Active
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">Loading DevSecOps platform telemetry...</div>
          ) : (
            <div>
              {/* Metric Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Security Score</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{summary.overallSecurityScore || 78}/100</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Projects</div>
                  <div className="text-2xl font-bold mt-1">{projects.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Pipeline Runs</div>
                  <div className="text-2xl font-bold mt-1">{summary.pipelineExecutions || 3}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Vulnerabilities</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{summary.openVulnerabilities || 6}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Active Threats</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">{summary.activeThreats || 2}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Compliance</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.complianceScore || 84}%</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
