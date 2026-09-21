import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HeartPulse, 
  Droplets, 
  ShieldAlert, 
  Users, 
  Home, 
  ClipboardList, 
  Volume2, 
  Loader2, 
  Send, 
  Info,
  Check,
  Languages
} from 'lucide-react';
import { EmergencyPhrase, Language } from '../types';
import { EMERGENCY_PHRASES } from '../data/emergencyPhrases';
import { playBase64Audio, speakWithBrowser } from '../utils/audioUtils';

interface EmergencyModeProps {
  languages: Language[];
  lowBandwidth: boolean;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({
  languages,
  lowBandwidth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('medical');
  const [targetLangId, setTargetLangId] = useState<string>('juba_arabic');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Custom urgent translation
  const [customUrgentText, setCustomUrgentText] = useState<string>('');
  const [customResult, setCustomResult] = useState<any | null>(null);
  const [isTranslatingCustom, setIsTranslatingCustom] = useState<boolean>(false);

  const categories = [
    { id: 'medical', label: 'Medical & Health', icon: HeartPulse, color: 'text-rose-400' },
    { id: 'water_food', label: 'Water & Food Relief', icon: Droplets, color: 'text-sky-400' },
    { id: 'protection', label: 'Safety & Protection', icon: ShieldAlert, color: 'text-amber-400' },
    { id: 'lost_family', label: 'Lost Family Tracing', icon: Users, color: 'text-purple-400' },
    { id: 'registration', label: 'Registration & Logistics', icon: ClipboardList, color: 'text-emerald-400' },
  ];

  const filteredPhrases = EMERGENCY_PHRASES.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const handlePlayPhrase = async (text: string, langId: string, phraseId: string) => {
    setPlayingId(phraseId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageId: langId }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, data.mimeType || 'audio/mp3');
      } else {
        speakWithBrowser(text, langId);
      }
    } catch (err) {
      speakWithBrowser(text, langId);
    } finally {
      setPlayingId(null);
    }
  };

  const handleCustomUrgentTranslate = async () => {
    if (!customUrgentText.trim()) return;
    setIsTranslatingCustom(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: customUrgentText,
          targetLang: targetLangId,
          lowBandwidth,
        }),
      });
      const data = await res.json();
      setCustomResult(data);
    } catch (err) {
      console.error('Custom emergency translation error:', err);
    } finally {
      setIsTranslatingCustom(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Emergency Header with High-Contrast Alert Styling */}
      <div className="bg-red-950/80 border-2 border-red-700/80 rounded-xl p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg">
            <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Emergency Translation & Rapid Response</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-800 text-red-100">
                CRISIS READY
              </span>
            </div>
            <p className="text-xs text-red-200 mt-1 max-w-2xl">
              High-priority instant audio phrasebook for humanitarian workers, clinics, refugee reception centers, and community responders across South Sudan.
            </p>
          </div>
        </div>

        {/* Global Target Language Switcher */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 flex items-center gap-2 w-full md:w-auto">
          <Languages className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">Broadcast Language</label>
            <select
              id="emergency-target-lang-select"
              value={targetLangId}
              onChange={(e) => setTargetLangId(e.target.value)}
              className="bg-transparent border-0 text-white text-xs font-semibold focus:outline-none pr-4"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medical/Legal Disclaimer Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Informational & Humanitarian Safety Notice:</strong> Emergency translations are intended to bridge urgent communication barriers. In clinical, medical, or life-safety situations, verify symptoms with trained medical personnel or community elders where possible.
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Verified Emergency Phrases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPhrases.map((phrase) => {
          const translationObj = phrase.translations[targetLangId];
          const hasTranslation = !!translationObj;
          const displayTranslation = hasTranslation
            ? translationObj.text
            : phrase.translations['juba_arabic']?.text || phrase.english;

          const displayPhonetic = hasTranslation
            ? translationObj.phonetic
            : phrase.translations['juba_arabic']?.phonetic || '';

          return (
            <div
              key={phrase.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md hover:border-slate-700 transition"
            >
              <div>
                {/* Header with Urgency Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      phrase.urgency === 'critical'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {phrase.urgency}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    Target: {languages.find((l) => l.id === targetLangId)?.name}
                  </span>
                </div>

                {/* English & Arabic Prompts */}
                <div className="space-y-1 mb-3">
                  <div className="text-sm font-semibold text-white">{phrase.english}</div>
                  <div className="text-xs text-slate-400 font-arabic" dir="rtl">{phrase.arabic}</div>
                </div>

                {/* Target Translation Banner */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                    Spoken Translation {hasTranslation ? '' : '(Fallback to Juba Arabic)'}
                  </span>
                  <div className="text-base font-bold text-sky-100 leading-snug">
                    {displayTranslation}
                  </div>
                  {displayPhonetic && (
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Pronunciation: {displayPhonetic}
                    </div>
                  )}
                </div>

                {phrase.culturalNote && (
                  <div className="text-[11px] text-slate-400 italic mt-2">
                    Note: {phrase.culturalNote}
                  </div>
                )}
              </div>

              {/* Action Button: Broadcast Audio */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  id={`play-emergency-${phrase.id}`}
                  onClick={() => handlePlayPhrase(displayTranslation, targetLangId, phrase.id)}
                  disabled={playingId === phrase.id}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md"
                >
                  {playingId === phrase.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span>Broadcast Audio Out Loud</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Urgent Query Translator Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Translate Custom Urgent Emergency Statement</span>
        </h3>
        <p className="text-xs text-slate-400">
          If your exact scenario is not listed in the standard phrasebook, enter it below for immediate dialect-aware translation.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={customUrgentText}
            onChange={(e) => setCustomUrgentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomUrgentTranslate();
            }}
            placeholder="Type urgent phrase (e.g. 'A child is injured and needs antibiotics')..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={handleCustomUrgentTranslate}
            disabled={isTranslatingCustom || !customUrgentText.trim()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center gap-2"
          >
            {isTranslatingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Translate Urgently</span>
          </button>
        </div>

        {/* Custom result output */}
        {customResult && (
          <div className="mt-3 p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Translation in {languages.find((l) => l.id === targetLangId)?.name}:
              </span>
              <button
                onClick={() => handlePlayPhrase(customResult.translatedText, targetLangId, 'custom')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Play Broadcast</span>
              </button>
            </div>
            <p className="text-lg font-bold text-white">{customResult.translatedText}</p>
            {customResult.phoneticPronunciation && (
              <p className="text-xs font-mono text-slate-400">
                Phonetic: {customResult.phoneticPronunciation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
