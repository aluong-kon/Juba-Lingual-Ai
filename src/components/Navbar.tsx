import React from 'react';
import { 
  Languages, 
  Mic2, 
  MessagesSquare, 
  Bot, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  BarChart3, 
  Download, 
  Wifi, 
  WifiOff, 
  HelpCircle,
  UserCheck,
  Database,
  Map,
  Network,
  Radio
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowBandwidth: boolean;
  setLowBandwidth: (val: boolean) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  onOpenOfflineModal: () => void;
  onOpenGuideModal: () => void;
  downloadedPacksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lowBandwidth,
  setLowBandwidth,
  userRole,
  setUserRole,
  onOpenOfflineModal,
  onOpenGuideModal,
  downloadedPacksCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner: Cultural & Bandwidth Status */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            10 Validated South Sudan Languages Live
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline">Phased expansion based on linguistic evidence</span>
        </div>

        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          {/* Low-Bandwidth Toggle */}
          <button
            id="low-bandwidth-toggle"
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-colors ${
              lowBandwidth 
                ? 'bg-amber-900/50 text-amber-300 border border-amber-700/80 font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle low-bandwidth optimization for low internet connectivity"
          >
            {lowBandwidth ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Low-Bandwidth Mode: {lowBandwidth ? 'ON' : 'OFF'}</span>
          </button>

          {/* User Role Selector */}
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 hidden md:inline">Role:</span>
            <select
              id="role-selector"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-sky-500"
            >
              <option value="Visitor">Visitor</option>
              <option value="Community Member">Community Contributor</option>
              <option value="Native Speaker">Native Speaker (Verified)</option>
              <option value="Linguist / Reviewer">Linguist / Reviewer</option>
              <option value="Admin">Platform Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 via-emerald-600 to-amber-600 flex items-center justify-center shadow-md shadow-sky-950">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">JubaLingua AI</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-sky-900/70 text-sky-300 border border-sky-700/50">
                  SSD
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                South Sudan Multilingual & Indigenous Language Intelligence
              </p>
            </div>
          </div>

          {/* Action buttons on right */}
          <div className="flex items-center gap-2">
            <button
              id="offline-packs-btn"
              onClick={onOpenOfflineModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Offline Packs</span>
              {downloadedPacksCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950 font-bold text-[10px]">
                  {downloadedPacksCount}
                </span>
              )}
            </button>

            <button
              id="linguistic-guide-btn"
              onClick={onOpenGuideModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="View how new South Sudanese languages are validated and added"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Linguistic Guide</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'translate', label: 'Translate & Voice', icon: Mic2 },
            { id: 'knowledge_base', label: 'Knowledge Base & Ingestion', icon: Database },
            { id: 'coverage_map', label: 'Coverage Map', icon: Map },
            { id: 'knowledge_graph', label: 'Knowledge Graph', icon: Network },
            { id: 'speech_database', label: 'Consented Speech', icon: Radio },
            { id: 'conversation', label: 'Live Conversation', icon: MessagesSquare },
            { id: 'assistant', label: 'AI Assistant', icon: Bot },
            { id: 'emergency', label: 'Emergency Mode', icon: AlertTriangle, highlight: true },
            { id: 'dictionary', label: 'Community Dictionary', icon: BookOpen },
            { id: 'validation', label: 'Validation Queue', icon: ShieldCheck },
            { id: 'dashboard', label: 'Dashboard & Metrics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? tab.highlight 
                      ? 'bg-red-600 text-white shadow' 
                      : 'bg-sky-600 text-white shadow'
                    : tab.highlight
                    ? 'text-red-300 hover:bg-red-950/40 hover:text-red-200'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? 'text-red-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
