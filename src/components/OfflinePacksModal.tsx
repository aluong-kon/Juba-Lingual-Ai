import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Check, 
  WifiOff, 
  HardDrive, 
  Loader2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Language } from '../types';

interface OfflinePacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: Language[];
  downloadedPacks: string[];
  setDownloadedPacks: React.Dispatch<React.SetStateAction<string[]>>;
}

interface PackInfo {
  langId: string;
  name: string;
  sizeMb: number;
  phraseCount: number;
  audioTokens: number;
  version: string;
}

export const OfflinePacksModal: React.FC<OfflinePacksModalProps> = ({
  isOpen,
  onClose,
  languages,
  downloadedPacks,
  setDownloadedPacks,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Offline Simulator Test
  const [simQuery, setSimQuery] = useState<string>('Where is clean water?');
  const [simLang, setSimLang] = useState<string>('dinka');
  const [simOutput, setSimOutput] = useState<string>('');

  if (!isOpen) return null;

  const packs: PackInfo[] = [
    { langId: 'juba_arabic', name: 'Juba Arabic Core Pack', sizeMb: 14.5, phraseCount: 8900, audioTokens: 4200, version: 'v2.4' },
    { langId: 'dinka', name: 'Dinka (Padang, Rek, Agar, Bor) Pack', sizeMb: 12.8, phraseCount: 6800, audioTokens: 3800, version: 'v2.1' },
    { langId: 'nuer', name: 'Nuer (Western, Lou, Jikany) Pack', sizeMb: 11.2, phraseCount: 5600, audioTokens: 3100, version: 'v2.0' },
    { langId: 'bari', name: 'Bari & Central Equatoria Pack', sizeMb: 9.4, phraseCount: 4400, audioTokens: 2500, version: 'v1.9' },
    { langId: 'zande', name: 'Zande (Pazande) Pack', sizeMb: 9.1, phraseCount: 4200, audioTokens: 2300, version: 'v1.8' },
    { langId: 'shilluk', name: 'Shilluk (Chollo) Pack', sizeMb: 7.9, phraseCount: 3900, audioTokens: 2100, version: 'v1.6' },
    { langId: 'acholi', name: 'Acholi Equatoria Pack', sizeMb: 6.9, phraseCount: 3500, audioTokens: 1800, version: 'v1.5' },
    { langId: 'toposa', name: 'Toposa Eastern Equatoria Pack', sizeMb: 6.2, phraseCount: 3100, audioTokens: 1600, version: 'v1.4' },
  ];

  const handleDownload = (pack: PackInfo) => {
    setDownloadingId(pack.langId);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadedPacks((current) => {
              const next = [...current, pack.langId];
              try {
                localStorage.setItem('jubalingua_offline_packs', JSON.stringify(next));
              } catch (e) {}
              return next;
            });
            setDownloadingId(null);
            setDownloadProgress(0);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleRemove = (langId: string) => {
    setDownloadedPacks((current) => {
      const next = current.filter((id) => id !== langId);
      try {
        localStorage.setItem('jubalingua_offline_packs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleSimulateOffline = () => {
    if (!downloadedPacks.includes(simLang)) {
      setSimOutput(`Language pack for ${simLang} is not downloaded locally! Please click 'Download' above first.`);
      return;
    }

    if (simQuery.toLowerCase().includes('water')) {
      if (simLang === 'dinka') setSimOutput('Piu cï kë yök tɛ̈nɛ? (Verified offline cache)');
      else if (simLang === 'juba_arabic') setSimOutput('Moya nadiif fi weyn? (Verified offline cache)');
      else if (simLang === 'nuer') setSimOutput('Piu ti gɔaa tɛ kɔɔ? (Verified offline cache)');
      else setSimOutput('Offline verified translation served from local device cache.');
    } else {
      setSimOutput(`Offline cache match found for "${simQuery}" in ${simLang}. (Latency: 0ms)`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Offline Language Packs</h3>
              <p className="text-xs text-slate-400">
                Download dictionary, phonetic rules, and emergency models to use without internet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-2 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-3 text-xs text-sky-200 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Zero-Data Guarantee:</strong> When in remote bomas, payams, or transit centers with no network, JubaLingua AI runs directly on device using downloaded linguistic models.
            </span>
          </div>

          {/* List of Language Packs */}
          <div className="space-y-2.5">
            {packs.map((pack) => {
              const isDownloaded = downloadedPacks.includes(pack.langId);
              const isDownloading = downloadingId === pack.langId;

              return (
                <div
                  key={pack.langId}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{pack.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                        {pack.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{pack.sizeMb} MB</span>
                      <span>•</span>
                      <span>{pack.phraseCount.toLocaleString()} phrases</span>
                      <span>•</span>
                      <span>{pack.audioTokens.toLocaleString()} phonetics</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full sm:w-auto flex items-center justify-end">
                    {isDownloading ? (
                      <div className="flex items-center gap-2 text-xs text-sky-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Downloading ({downloadProgress}%)...</span>
                      </div>
                    ) : isDownloaded ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                          <Check className="w-3.5 h-3.5" />
                          <span>Installed</span>
                        </span>
                        <button
                          onClick={() => handleRemove(pack.langId)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                          title="Remove Pack"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(pack)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Pack</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offline Mode Live Test Simulator */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Translation Simulator</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
                placeholder="Type query to test offline..."
              />
              <select
                value={simLang}
                onChange={(e) => setSimLang(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2"
              >
                {packs.map((p) => (
                  <option key={p.langId} value={p.langId}>
                    {p.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulateOffline}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition"
            >
              Test Offline Query (Simulate Airplane Mode)
            </button>

            {simOutput && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                {simOutput}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
