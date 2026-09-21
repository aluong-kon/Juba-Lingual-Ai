import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Mic2, 
  Languages, 
  Volume2, 
  ShieldCheck, 
  Search, 
  Info,
  ChevronRight,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { LanguageCoverageStatus } from '../types';

export const CoverageMatrixView: React.FC = () => {
  const [coverageData, setCoverageData] = useState<LanguageCoverageStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'matrix' | 'policy' | 'geography'>('matrix');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const res = await fetch('/api/coverage/matrix');
        if (res.ok) {
          const data = await res.json();
          setCoverageData(data.coverage || []);
        }
      } catch (err) {
        console.error('Failed to load coverage matrix:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoverage();
  }, []);

  const families = Array.from(new Set(coverageData.map(c => c.linguisticFamily)));

  const filtered = coverageData.filter(item => {
    const matchesFamily = selectedFamily === 'all' || item.linguisticFamily === selectedFamily;
    const matchesQuery = !searchQuery || 
      item.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dialects.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.linguisticFamily.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesQuery;
  });

  const getStatusBadge = (val: string) => {
    const isTopTier = [
      'Extensive', 'High', 'Consented Archive', 'Operational', 'Validated RAG', 'Active Panel (3+ Validations)'
    ].includes(val);

    const isMidTier = [
      'Moderate', 'Medium', 'Sample Recordings', 'Experimental', 'Provisional RAG', 'Native Samples', 'Peer Reviewed'
    ].includes(val);

    const isInitialTier = [
      'Limited', 'Initial', 'Community Sourced', 'Synthetic Preview', 'Recruiting Speakers'
    ].includes(val);

    if (isTopTier) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{val}</span>
        </span>
      );
    }

    if (isMidTier) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-800">
          <Clock className="w-3 h-3 text-sky-400" />
          <span>{val}</span>
        </span>
      );
    }

    if (isInitialTier) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
          <span>{val}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        <span>{val}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Map className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">South Sudan Language Coverage Map</h1>
                <p className="text-xs text-sky-300/80">Empirical Linguistic Status & Multi-Dimensional Readiness Matrix</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Transparent, data-backed documentation of computational readiness across South Sudanese languages. 
              We track available dictionaries, text corpora, consented voice databases, speech models, translation, and native speaker verification.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center sm:text-right shrink-0">
            <div className="text-2xl font-bold text-sky-400 font-mono">
              {coverageData.length} Documented
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Empirical Phased Expansion
            </div>
          </div>
        </div>

        {/* Empirical Integrity Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Strict Linguistic Integrity Policy:</strong> JubaLingua AI explicitly rejects marketing claims 
            such as "Supports all 64 South Sudanese languages" without validated datasets. An ethnic community designation does not automatically 
            equal a distinct computational language model. We only declare support when authoritative dictionaries, corpora, and native speaker panels are actively verified.
          </p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Full Readiness Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('geography')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'geography'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Geographic Distribution (10 States & 3 Admin Areas)</span>
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'policy'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Validation Standards & Roadmap</span>
        </button>
      </div>

      {/* View 1: Full Readiness Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language, dialect, or linguistic family..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Language Families</option>
                {families.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Language & Family</th>
                    <th className="py-3 px-4">Key Dialect Varieties</th>
                    <th className="py-3 px-4 text-center">Dictionary</th>
                    <th className="py-3 px-4 text-center">Corpus</th>
                    <th className="py-3 px-4 text-center">Audio</th>
                    <th className="py-3 px-4 text-center">Speech (STT)</th>
                    <th className="py-3 px-4 text-center">Translation</th>
                    <th className="py-3 px-4 text-center">Voice (TTS)</th>
                    <th className="py-3 px-4 text-center">Human Panel</th>
                    <th className="py-3 px-4 text-right">Coverage %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filtered.map((item) => (
                    <tr key={item.language} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{item.language}</div>
                        <div className="text-[11px] text-slate-400">{item.linguisticFamily}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {item.dialects.map((d, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.availableDictionary)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.availableCorpus)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.availableAudio)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.speechRecognition)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.translation)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.textToSpeech)}</td>
                      <td className="py-3.5 px-4 text-center">{getStatusBadge(item.humanVerification)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {item.coveragePercent}%
                          </span>
                        </div>
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                          <div
                            className={`h-full rounded-full ${
                              item.coveragePercent >= 80 
                                ? 'bg-emerald-500' 
                                : item.coveragePercent >= 50 
                                ? 'bg-sky-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.coveragePercent}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Geographic Distribution */}
      {activeTab === 'geography' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-sky-400" />
              <span>South Sudan Geographic Language Mapping</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Languages in South Sudan cross state and administrative boundaries. Below is how our primary linguistic datasets map to the 10 States and 3 Administrative Areas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Central Equatoria (Juba)</h3>
                <p className="text-xs text-slate-300"><strong>Dominant Lingua Franca:</strong> Juba Arabic</p>
                <p className="text-xs text-slate-400"><strong>Indigenous Languages:</strong> Bari, Pojulu, Lokoya, Nyangwara, Mundari</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Authoritative Spagnolo & Juba Arabic Lexicons Ingested</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Western Bahr el Ghazal & Warrap</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Dinka (Southwestern Rek, Luanyjang), Luo (Jur Beli/Jur Modo)</p>
                <p className="text-xs text-slate-400"><strong>Dialects:</strong> Rek, Malual, Tonj, Wau</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Dinka Digital Library Rek Corpus Integrated</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Lakes State (Rumbek)</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Dinka (South Central Agar, Gok, Ciec), South Aliap</p>
                <p className="text-xs text-slate-400"><strong>Dialects:</strong> Agar (Rumbek), Ciec (Yirol), Aliap (Awerial)</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Agar & Aliap variety distinction active</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Unity State & Ruweng Area</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Western Nuer (Bentiu, Leek, Bul, Dok), Dinka (Northwestern Ruweng)</p>
                <p className="text-xs text-slate-400"><strong>Varieties:</strong> Western Thok Naath, Panaruu, Alor</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Ray Huffman Nuer Lexicon & Ruweng entries validated</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Jonglei State & Pibor Admin Area</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Dinka (Southeastern Bor, Twic, Duk), Lou Nuer, Murle (Aman Murle), Anyuak</p>
                <p className="text-xs text-slate-400"><strong>Varieties:</strong> Bor, Twic East, Murle highlands, Lou</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Bor Dinka, Lou Nuer, and Murle entries indexed</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Upper Nile (Malakal, Fashoda)</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Shilluk (Dhøg Cølø), Eastern Jikany Nuer, Dinka (Northeastern Padang)</p>
                <p className="text-xs text-slate-400"><strong>Varieties:</strong> Fashoda Shilluk, Nasir Jikany, Dongjol</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Chollo Lexical Council & Jikany datasets verified</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Western Equatoria (Yambio)</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Zande (Päzande), Moru, Avokaya, Baka</p>
                <p className="text-xs text-slate-400"><strong>Varieties:</strong> Yambio, Tambura, Maridi</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ E.C. Gore Päzande Dictionary integrated</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-sky-400 text-sm">Eastern Equatoria (Torit, Kapoeta)</h3>
                <p className="text-xs text-slate-300"><strong>Dominant:</strong> Toposa (Ateker), Lotuko (Otuho), Lopit, Acholi, Ma'di, Didinga</p>
                <p className="text-xs text-slate-400"><strong>Varieties:</strong> Kapoeta Toposa, Torit Otuho, Nimule Ma'di, Magwi Acholi</p>
                <p className="text-[11px] text-emerald-400 mt-2">✓ Toposa Ateker & Savage Acholi corpus active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Validation Standards & Roadmap */}
      {activeTab === 'policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Ethical AI Validation Criteria</span>
          </h2>
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              For a language or dialect to transition from <em>Planned</em> to <em>Verified Live</em>, it must pass four rigorous gates:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-sky-300 mb-1">Gate 1: Authoritative Lexical Foundation</h4>
                <p className="text-slate-400">
                  Must possess a documented dictionary or linguistic wordlist of at least 500 core lemmas with verified parts of speech, plural forms, and tone/breath markers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-sky-300 mb-1">Gate 2: Consented Speech Database</h4>
                <p className="text-slate-400">
                  Must have native speaker audio recordings across core domains (healthcare, greetings, agriculture, emergency) with signed/recorded consent and noise checks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-sky-300 mb-1">Gate 3: Dialect Differentiation</h4>
                <p className="text-slate-400">
                  Must explicitly distinguish regional varieties (e.g. Western vs Eastern Nuer, Rek vs Bor Dinka) so morphological shifts are not treated as errors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-sky-300 mb-1">Gate 4: Multi-Validator Community Consensus</h4>
                <p className="text-slate-400">
                  All translations and community contributions require at least 3 native speaker validations or 1 certified academic linguist sign-off before model updating.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
