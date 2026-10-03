import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Mic2, 
  BookPlus, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Volume2, 
  ArrowRight, 
  Filter, 
  RotateCcw, 
  Plus, 
  Check, 
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { UserContributionStats, ContributionActivity } from '../types';

interface UserContributionTrackerProps {
  userRole: string;
  onNavigateTab?: (tab: string) => void;
  onOpenContributeModal?: () => void;
}

export const UserContributionTracker: React.FC<UserContributionTrackerProps> = ({
  userRole,
  onNavigateTab,
  onOpenContributeModal,
}) => {
  const [stats, setStats] = useState<UserContributionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/contributions?role=${encodeURIComponent(userRole)}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load user contribution stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userRole]);

  // Audio preview playback using SpeechSynthesis or Web Audio fallback
  const handlePlaySample = (activity: ContributionActivity) => {
    const textToSpeak = activity.nativeText || activity.title;
    if (!textToSpeak) return;

    setPlayingAudioId(activity.id);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 1500);
    }
  };

  // Simulate a live contribution to demonstrate instant visual progress update
  const handleSimulateContribution = async (type: 'word_verified' | 'audio_uploaded') => {
    setIsSimulating(true);
    setSimulatedFeedback(null);
    try {
      const sampleItem = type === 'word_verified' ? {
        type: 'word_verified',
        title: 'Verified agricultural seasonal term',
        nativeText: 'Ker (First rainy season planting)',
        translation: 'Beginning of the rainy season / initial farming period',
        language: 'Dinka (Thuɔŋjäŋ)',
        dialect: 'Rek',
        category: 'agriculture'
      } : {
        type: 'audio_uploaded',
        title: 'Uploaded consented elder voice token',
        nativeText: 'Ita fi amān (You are safe with us)',
        translation: 'Reassurance of security and welcome in South Sudan',
        language: 'Juba Arabic',
        dialect: 'Central Equatorian (Juba)',
        category: 'humanitarian assistance'
      };

      const res = await fetch('/api/user/contributions/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleItem)
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.updatedStats);
        setSimulatedFeedback(type === 'word_verified' ? '+1 Verified Word Added' : '+1 Consented Audio Sample Uploaded');
        setTimeout(() => setSimulatedFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Failed to simulate contribution:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch('/api/user/contributions/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStats(data.updatedStats);
      }
    } catch (err) {
      console.error('Failed to reset contribution stats:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading contribution telemetry...</p>
      </div>
    );
  }

  if (!stats) return null;

  // Filter activities
  const filteredActivities = stats.recentActivities.filter(act => {
    const matchesType = activityFilter === 'all' || act.type === activityFilter;
    const matchesLang = languageFilter === 'all' || 
      act.language.toLowerCase().includes(languageFilter.toLowerCase());
    return matchesType && matchesLang;
  });

  const totalContributions = stats.totalVerifiedWords + stats.totalAudioSamples + stats.totalTermsContributed + stats.totalDialectReviews;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-8">
      {/* Header & Contributor Identity */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-sky-400">
                Personal Fieldwork & Language Telemetry
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-medium">NileAI Multilingual Network</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {stats.contributorName}
              </h2>
              <span className="text-sm text-slate-400">
                ({userRole || stats.contributorRole})
              </span>
              <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                {stats.impactRank}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time tracking of native lexical verifications, consented speech recordings, and orthographic validations supporting indigenous South Sudanese language intelligence.
            </p>
          </div>

          {/* Quick Actions & Live Simulator */}
          <div className="flex flex-wrap items-center gap-2">
            {simulatedFeedback && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded animate-fade-in font-medium">
                <Check className="w-3.5 h-3.5" />
                {simulatedFeedback}
              </span>
            )}

            <button
              onClick={() => handleSimulateContribution('word_verified')}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800 transition"
              title="Test real-time increment of verified words"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Verify Sample</span>
            </button>

            <button
              onClick={() => handleSimulateContribution('audio_uploaded')}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition"
              title="Test real-time increment of audio samples"
            >
              <Mic2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Audio Sample</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition"
              title="Reset metrics to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {stats.currentTier}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                Progress to <strong className="text-amber-400 font-medium">{stats.nextTierTitle}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="tabular-nums font-mono text-slate-200 font-medium">{stats.streakDays}</span> day streak
              </span>
              <span className="text-slate-600">·</span>
              <span>
                <strong className="tabular-nums font-mono text-white font-semibold">{stats.itemsToNextTier}</strong> contributions needed
              </span>
            </div>
          </div>

          {/* Visual Progress Bar with milestones */}
          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-sky-600 via-emerald-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.tierProgress}%` }}
            />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-1">
            <span>Tier 1: Apprentice (50)</span>
            <span>Tier 2: Fieldworker (120)</span>
            <span className="text-sky-400 font-semibold">Tier 3: Custodian (300) [Current]</span>
            <span>Tier 4: Archivist (500)</span>
            <span>Tier 5: Elder (750+)</span>
          </div>
        </div>
      </div>

      {/* 4 Core Contribution Metrics (Tabular Numerals, 60-30-10, Zero Pill Sandwiches) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-b border-slate-800 bg-slate-950/40">
        {/* Metric 1: Verified Words */}
        <div className="p-5 hover:bg-slate-850/30 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Words Verified</span>
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums font-mono">
              {stats.totalVerifiedWords}
            </span>
            <span className="text-xs text-sky-400 font-medium">98.4% consensus</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cross-checked with native speakers & linguistic lexicons
          </p>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('validation')}
              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-3 font-medium transition"
            >
              <span>Review pending queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Metric 2: Audio Samples Uploaded */}
        <div className="p-5 hover:bg-slate-850/30 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Audio Samples Uploaded</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Mic2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums font-mono">
              {stats.totalAudioSamples}
            </span>
            <span className="text-xs text-emerald-400 font-medium">100% consented</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Studio & field-recorded speech tokens with informed consent
          </p>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('speech_database')}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-3 font-medium transition"
            >
              <span>Record voice sample</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Metric 3: Terms Contributed */}
        <div className="p-5 hover:bg-slate-850/30 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Vocabulary Contributed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <BookPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums font-mono">
              {stats.totalTermsContributed}
            </span>
            <span className="text-xs text-amber-400 font-medium">58 in live archive</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            New lexical entries & contextual cultural explanations
          </p>
          {onOpenContributeModal && (
            <button
              onClick={onOpenContributeModal}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-3 font-medium transition"
            >
              <span>Submit new phrase</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Metric 4: Quality & Dialect Reviews */}
        <div className="p-5 hover:bg-slate-850/30 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Dialect Audits & Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums font-mono">
              {stats.totalDialectReviews}
            </span>
            <span className="text-xs text-purple-400 font-medium">100% completed</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Discrepancy resolutions & dialect distinction mapping
          </p>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('coverage_map')}
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-3 font-medium transition"
            >
              <span>View dialect matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Grid: Language Breakdown & Weekly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 border-b border-slate-800">
        {/* Language Breakdown */}
        <div className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Contribution Distribution Across South Sudan Languages
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of validated words and audio recordings by language community
              </p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums font-mono">
              {totalContributions} total actions
            </span>
          </div>

          <div className="space-y-3.5">
            {stats.languageBreakdown.map((item) => (
              <div key={item.languageId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-200">{item.language}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="tabular-nums font-mono text-slate-300">
                      {item.verifiedWords} words
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="tabular-nums font-mono text-slate-300">
                      {item.audioRecordings} audio
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="tabular-nums font-mono font-semibold text-white w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Fieldwork Target & Community Badges */}
        <div className="p-6 bg-slate-950/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Weekly Fieldwork Goal
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {Math.round((stats.weeklyCompleted / stats.weeklyTarget) * 100)}% Reached
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {stats.weeklyCompleted}
              </span>
              <span className="text-xs text-slate-400">
                of <strong className="text-slate-200 tabular-nums font-mono">{stats.weeklyTarget}</strong> weekly target contributions
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-4">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((stats.weeklyCompleted / stats.weeklyTarget) * 100))}%` }}
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-medium">
                <Award className="w-4 h-4" />
                <span>Earned Community Recognitions</span>
              </div>
              <ul className="space-y-1 text-slate-400 pl-1 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>Certified Jieng Diacritics Reviewer</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Consented Voice Database Founding Voice</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Equatorian & Upper Nile Dialect Specialist</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verified with cryptographic provenance</span>
            <span className="text-slate-400 font-mono">ID: {stats.userId}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Contributions Timeline & Feed */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recent Contribution Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of verified phrases, consented audio tokens, and linguistic additions
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Activity Type */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'word_verified', label: 'Words' },
                { id: 'audio_uploaded', label: 'Audio' },
                { id: 'term_contributed', label: 'Phrases' },
                { id: 'dialect_reviewed', label: 'Dialects' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    activityFilter === f.id
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filter by Language */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Languages</option>
              <option value="dinka">Dinka</option>
              <option value="juba_arabic">Juba Arabic</option>
              <option value="nuer">Nuer</option>
              <option value="bari">Bari</option>
              <option value="zande">Zande</option>
            </select>
          </div>
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80 text-slate-400">
            <p className="text-xs">No contribution entries match the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActivities.slice(0, 8).map((activity) => {
              const isAudio = activity.type === 'audio_uploaded';
              const isWord = activity.type === 'word_verified';
              const isTerm = activity.type === 'term_contributed';
              const isDialect = activity.type === 'dialect_reviewed';

              return (
                <div 
                  key={activity.id}
                  className="p-3.5 rounded-lg bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isWord ? 'bg-sky-950 text-sky-400 border border-sky-800/60' :
                      isAudio ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                      isTerm ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                      'bg-purple-950 text-purple-400 border border-purple-800/60'
                    }`}>
                      {isWord && <CheckCircle2 className="w-4 h-4" />}
                      {isAudio && <Mic2 className="w-4 h-4" />}
                      {isTerm && <BookPlus className="w-4 h-4" />}
                      {isDialect && <ShieldCheck className="w-4 h-4" />}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {activity.title}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-medium text-sky-400">
                          {activity.language}
                        </span>
                        {activity.dialect && (
                          <span className="text-xs text-slate-500">
                            ({activity.dialect})
                          </span>
                        )}
                      </div>

                      {/* Native text and translation */}
                      {(activity.nativeText || activity.translation) && (
                        <div className="text-xs mt-1 text-slate-400">
                          {activity.nativeText && (
                            <span className="font-semibold text-slate-200 font-serif mr-2">
                              "{activity.nativeText}"
                            </span>
                          )}
                          {activity.translation && (
                            <span className="text-slate-400 italic">
                              — {activity.translation}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right metadata & Play button */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {activity.timestamp}
                    </span>

                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300">
                      {activity.status}
                    </span>

                    {/* Play Audio Button for audio uploads */}
                    {(isAudio || activity.nativeText) && (
                      <button
                        onClick={() => handlePlaySample(activity)}
                        className={`p-1.5 rounded text-xs transition border ${
                          playingAudioId === activity.id 
                            ? 'bg-sky-500 text-slate-950 border-sky-400 animate-pulse'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Listen to native pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
