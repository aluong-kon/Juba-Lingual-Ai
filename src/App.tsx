import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TranslateView } from './components/TranslateView';
import { ConversationMode } from './components/ConversationMode';
import { AIAssistantView } from './components/AIAssistantView';
import { EmergencyMode } from './components/EmergencyMode';
import { CommunityDictionary } from './components/CommunityDictionary';
import { ValidationPortal } from './components/ValidationPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { KnowledgeBaseDashboard } from './components/KnowledgeBaseDashboard';
import { CoverageMatrixView } from './components/CoverageMatrixView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { ConsentedVoiceDatabase } from './components/ConsentedVoiceDatabase';
import { OfflinePacksModal } from './components/OfflinePacksModal';
import { LinguisticGuideModal } from './components/LinguisticGuideModal';
import { ContributeModal } from './components/ContributeModal';

import { Language } from './types';
import { INITIAL_LANGUAGES } from './data/languages';
import { Heart, Globe, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('translate');
  const [languages, setLanguages] = useState<Language[]>(INITIAL_LANGUAGES);

  // Low bandwidth state
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jubalingua_low_bandwidth') === 'true';
    } catch {
      return false;
    }
  });

  // User role state
  const [userRole, setUserRole] = useState<string>('Visitor');

  // Offline packs cache list
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jubalingua_offline_packs');
      return stored ? JSON.parse(stored) : ['juba_arabic'];
    } catch {
      return ['juba_arabic'];
    }
  });

  // Modals state
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState<boolean>(false);
  const [contributePrefill, setContributePrefill] = useState<{ sourceText?: string; languageId?: string } | null>(null);

  // Sync low-bandwidth toggle to storage
  useEffect(() => {
    try {
      localStorage.setItem('jubalingua_low_bandwidth', lowBandwidth.toString());
    } catch {}
  }, [lowBandwidth]);

  // Load languages from backend
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('/api/languages');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLanguages(data);
          }
        }
      } catch (err) {
        console.warn('Using local language repository fallback:', err);
      }
    };
    fetchLanguages();
  }, []);

  const handleOpenContribution = (prefill?: { sourceText: string; languageId: string }) => {
    setContributePrefill(prefill || null);
    setIsContributeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        downloadedPacksCount={downloadedPacks.length}
      />

      {/* Main App View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'translate' && (
          <TranslateView
            languages={languages}
            lowBandwidth={lowBandwidth}
            userRole={userRole}
            onOpenContributionModal={handleOpenContribution}
          />
        )}

        {activeTab === 'knowledge_base' && (
          <KnowledgeBaseDashboard />
        )}

        {activeTab === 'coverage_map' && (
          <CoverageMatrixView />
        )}

        {activeTab === 'knowledge_graph' && (
          <KnowledgeGraphView />
        )}

        {activeTab === 'speech_database' && (
          <ConsentedVoiceDatabase languages={languages} />
        )}

        {activeTab === 'conversation' && (
          <ConversationMode
            languages={languages}
            lowBandwidth={lowBandwidth}
          />
        )}

        {activeTab === 'assistant' && <AIAssistantView />}

        {activeTab === 'emergency' && (
          <EmergencyMode
            languages={languages}
            lowBandwidth={lowBandwidth}
          />
        )}

        {activeTab === 'dictionary' && (
          <CommunityDictionary
            languages={languages}
            userRole={userRole}
            onOpenContributeModal={handleOpenContribution}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationPortal
            languages={languages}
            userRole={userRole}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard languages={languages} />
        )}
      </main>

      {/* Modals */}
      <OfflinePacksModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        languages={languages}
        downloadedPacks={downloadedPacks}
        setDownloadedPacks={setDownloadedPacks}
      />

      <LinguisticGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setContributePrefill(null);
        }}
        languages={languages}
        userRole={userRole}
        prefill={contributePrefill}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">JubaLingua AI</span>
            <span>•</span>
            <span>Community-Driven South Sudan Multilingual Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-slate-200 transition underline underline-offset-4"
            >
              Linguistic Methodology
            </button>
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="hover:text-slate-200 transition underline underline-offset-4"
            >
              Offline Packs
            </button>
            <span>Verified Human In The Loop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
