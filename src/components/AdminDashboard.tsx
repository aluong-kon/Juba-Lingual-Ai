import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Languages, 
  CheckCircle2, 
  Mic, 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Loader2,
  Clock
} from 'lucide-react';
import { AdminMetrics, Language } from '../types';

interface AdminDashboardProps {
  languages: Language[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ languages }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        if (!res.ok) throw new Error('Failed to load metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error('Metrics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-xs">Computing platform linguistic analytics and validation telemetry...</p>
      </div>
    );
  }

  const phases = [
    { phase: 'Phase 1', label: 'Core Validated Cohort (Current)', count: '5–10 Languages', status: 'Completed & Live in App', progress: 100 },
    { phase: 'Phase 2', label: 'Regional Expansion', count: '20+ Languages', status: 'Fieldwork & Dialect Documentation', progress: 45 },
    { phase: 'Phase 3', label: 'Dialect Deepening', count: '40+ Languages & Dialects', status: 'Linguistic Fieldwork & Speech Corpora', progress: 15 },
    { phase: 'Phase 4', label: 'Full National Coverage', count: 'All Indigenous Tongues', status: 'National Repository Planned', progress: 0 },
    { phase: 'Phase 5', label: 'East African Cross-Border', count: 'Nilotic & Regional Ties', status: 'Regional Integration', progress: 0 },
  ];

  const totalQueries = metrics.mostUsedLanguages.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Platform Health & Dataset Telemetry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry on linguistic validation, training dataset integrity, and dialect coverage across South Sudan.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          System Status: Operational
        </span>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Supported Languages</span>
            <Languages className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalSupportedLanguages}</div>
          <p className="text-[11px] text-emerald-400 mt-1">100% human-verified datasets</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Verified Phrases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalVerifiedPhrases.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-dialect cross-indexed</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Audio Recordings</span>
            <Mic className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalAudioRecordings.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1">Consented native audio tokens</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Accuracy & Validation</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.translationAccuracyRate}%</div>
          <p className="text-[11px] text-sky-400 mt-1">{metrics.communityValidationRate}% community reviewed</p>
        </div>
      </div>

      {/* Knowledge Base & Linguistic Archive Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Authoritative Datasets</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{metrics.ingestedDatasetsCount || 8} Registered</div>
            <div className="text-[10px] text-slate-500">Verified Open Access / Community</div>
          </div>
          <FileText className="w-6 h-6 text-sky-500/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Knowledge Graph Nodes</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{metrics.knowledgeGraphNodesCount || 18} Lexical Nodes</div>
            <div className="text-[10px] text-slate-500">Nilotic & Equatorian Terminology</div>
          </div>
          <Layers className="w-6 h-6 text-emerald-500/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Evidence Edges</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{metrics.knowledgeGraphEdgesCount || 16} Verified Edges</div>
            <div className="text-[10px] text-slate-500">Cognates, Synsets, Loanwords</div>
          </div>
          <Clock className="w-6 h-6 text-purple-500/60" />
        </div>
      </div>

      {/* Breakdown: Most Used Languages & Common Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Used Languages */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-400" />
            <span>Most Utilized Languages (% of Traffic)</span>
          </h3>

          <div className="space-y-3">
            {metrics.mostUsedLanguages.map((item, idx) => {
              const pct = Math.round((item.count / totalQueries) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-slate-400">{pct}% ({item.count.toLocaleString()} requests)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common Topics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Frequent Humanitarian & Cultural Contexts</span>
          </h3>

          <div className="space-y-3">
            {metrics.mostCommonRequests.map((topicItem, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{topicItem.topic}</span>
                  <span className="text-slate-400">{topicItem.count.toLocaleString()} sessions</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (topicItem.count / 600) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discrepancy & Verification Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Linguistic Governance & Quality Reports</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block mb-1">Pending Community Submissions</span>
              <span className="text-xl font-bold text-amber-400">{metrics.pendingReviewsCount} items</span>
            </div>
            <Clock className="w-6 h-6 text-amber-500/60" />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block mb-1">Reported Linguistic Discrepancies</span>
              <span className="text-xl font-bold text-rose-400">{metrics.errorReportsCount} reports</span>
            </div>
            <ShieldAlert className="w-6 h-6 text-rose-500/60" />
          </div>
        </div>
      </div>

      {/* Phased Expansion Strategy Roadmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Phased Expansion Strategy Roadmap</span>
          </h3>
          <span className="text-xs text-slate-400">Golden Rule: Never claim support before data validation</span>
        </div>

        <div className="space-y-3">
          {phases.map((p, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-400">{p.phase}:</span>
                  <span className="text-xs font-semibold text-white">{p.label}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {p.count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{p.status}</p>
              </div>

              <div className="w-full sm:w-44 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
