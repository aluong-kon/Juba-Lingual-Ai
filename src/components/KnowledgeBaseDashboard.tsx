import React, { useState, useEffect } from 'react';
import { 
  Database, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ExternalLink, 
  Layers, 
  Scale, 
  PlusCircle,
  FileCode,
  Tag,
  Sparkles,
  Info,
  RefreshCw,
  Filter
} from 'lucide-react';
import { LinguisticDatasetProvenance, IngestionEntry, SourcePriorityLevel } from '../types';

export const KnowledgeBaseDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'provenance' | 'pipeline' | 'entries'>('provenance');
  const [datasets, setDatasets] = useState<LinguisticDatasetProvenance[]>([]);
  const [entries, setEntries] = useState<IngestionEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Ingestion form state
  const [rawPayload, setRawPayload] = useState<string>('');
  const [payloadFormat, setPayloadFormat] = useState<'json' | 'csv' | 'tei_text'>('json');
  const [sourceName, setSourceName] = useState<string>('Dinka Digital Library (Fieldwork Corpus)');
  const [licenseType, setLicenseType] = useState<string>('Creative Commons CC-BY-SA 4.0');
  const [sourcePriority, setSourcePriority] = useState<SourcePriorityLevel>('Level 2: Academic linguistic resource');
  const [copyrightConfirmed, setCopyrightConfirmed] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string; count?: number; errors?: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Load datasets and entries from server
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, resEntries] = await Promise.all([
        fetch('/api/ingestion/datasets'),
        fetch('/api/ingestion/entries?limit=100')
      ]);

      if (resData.ok) {
        const d = await resData.json();
        setDatasets(d.datasets || []);
      }
      if (resEntries.ok) {
        const e = await resEntries.json();
        setEntries(e.entries || []);
      }
    } catch (err) {
      console.error('Failed to load ingestion data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill sample datasets in importer
  const loadSampleTemplate = (type: 'dinka' | 'nuer' | 'bari') => {
    if (type === 'dinka') {
      setSourceName('Dinka Digital Library & Dialect Corpus');
      setLicenseType('Creative Commons CC-BY-SA 4.0');
      setSourcePriority('Level 1: Native-speaker verified');
      setRawPayload(JSON.stringify([
        {
          language: 'Dinka',
          dialect: 'Southwestern (Rek)',
          word: 'baai',
          lemma: 'baai',
          definition: 'Home, homestead, village community, native land',
          english_translation: 'home / homestead',
          arabic_translation: 'بيت / وطن',
          part_of_speech: 'noun',
          plural_form: 'bɛɛi',
          example_sentence: 'Mïth a-cï dhuk baai kɛ pial.',
          IPA: '/baːj/',
          pronunciation: 'BAH-ee',
          region: 'Warrap, Tonj, Wau',
          source: 'Dinka Digital Library (Rek Corpus)',
          license: 'CC-BY-SA 4.0',
          confidence: 0.98,
          verified: true,
          sourcePriorityLevel: 'Level 1: Native-speaker verified',
          evidenceType: 'dictionary'
        },
        {
          language: 'Dinka',
          dialect: 'South Central (Agar)',
          word: 'wɛ̈ɛ̈ŋ',
          lemma: 'wɛ̈ɛ̈ŋ',
          definition: 'Cow, cattle beast, cornerstone of pastoral society',
          english_translation: 'cow / cattle',
          arabic_translation: 'بقرة',
          part_of_speech: 'noun',
          plural_form: 'wëk',
          IPA: '/wɛ̤ːŋ/',
          pronunciation: 'WEH-ehng',
          region: 'Lakes State (Rumbek)',
          source: 'Dinka Digital Library (Agar Lexicon)',
          license: 'CC-BY-SA 4.0',
          confidence: 0.99,
          verified: true,
          sourcePriorityLevel: 'Level 2: Academic linguistic resource',
          evidenceType: 'dictionary'
        }
      ], null, 2));
    } else if (type === 'nuer') {
      setSourceName('Nuer Lexicon & Naath Cultural Association');
      setLicenseType('Creative Commons CC-BY 4.0');
      setSourcePriority('Level 1: Native-speaker verified');
      setRawPayload(JSON.stringify([
        {
          language: 'Nuer',
          dialect: 'Western Nuer (Bentiu)',
          word: 'mälɛ',
          lemma: 'mäl',
          definition: 'Peace, tranquility, absence of strife, mutual health',
          english_translation: 'peace / health / wellbeing',
          arabic_translation: 'سلام / عافية',
          part_of_speech: 'noun',
          plural_form: 'mälɛni',
          IPA: '/maːlɛ/',
          pronunciation: 'MAH-leh',
          region: 'Unity State (Bentiu)',
          source: 'Nuer Lexicon (Ray Huffman Archive & Naath Elders)',
          license: 'CC-BY 4.0',
          confidence: 0.99,
          verified: true,
          sourcePriorityLevel: 'Level 1: Native-speaker verified',
          evidenceType: 'dictionary'
        }
      ], null, 2));
    } else {
      setSourceName('Bari Language Archive & Father Spagnolo Lexicon');
      setLicenseType('Public Domain / Open Verification');
      setSourcePriority('Level 3: Established dictionary/lexicon');
      setRawPayload(JSON.stringify([
        {
          language: 'Bari',
          dialect: 'Bari Central',
          word: 'kulyan',
          lemma: 'kulyan',
          definition: 'News, communal affairs, spoken words',
          english_translation: 'news / words / speech',
          arabic_translation: 'أخبار / كلام',
          part_of_speech: 'noun',
          plural_form: 'kulyasi',
          IPA: '/kuˈljaːn/',
          pronunciation: 'kool-YAHN',
          region: 'Central Equatoria (Juba)',
          source: 'Father Spagnolo Verona Lexicon rev.',
          license: 'Public Domain',
          confidence: 0.98,
          verified: true,
          sourcePriorityLevel: 'Level 3: Established dictionary/lexicon',
          evidenceType: 'dictionary'
        }
      ], null, 2));
    }
  };

  // Execute Ingestion
  const handleExecuteIngest = async () => {
    if (!copyrightConfirmed) {
      setImportStatus({
        success: false,
        message: 'Copyright Confirmation Required: You must verify that the resource is legally licensed (Open Access, CC, Public Domain, or community consent).'
      });
      return;
    }

    if (!rawPayload.trim()) {
      setImportStatus({ success: false, message: 'Please provide payload content to ingest.' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      let parsedEntries: any[] = [];

      if (payloadFormat === 'json') {
        try {
          parsedEntries = JSON.parse(rawPayload);
          if (!Array.isArray(parsedEntries)) {
            parsedEntries = [parsedEntries];
          }
        } catch (e: any) {
          throw new Error(`Invalid JSON syntax: ${e.message}`);
        }
      } else if (payloadFormat === 'csv') {
        // Simple CSV parser
        const lines = rawPayload.trim().split('\n');
        if (lines.length < 2) throw new Error('CSV must contain a header and at least one data row.');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        parsedEntries = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const item: any = {};
          headers.forEach((h, i) => {
            item[h] = values[i] || '';
          });
          return item;
        });
      } else {
        // Plain text lines parser: word = translation (definition)
        const lines = rawPayload.trim().split('\n');
        parsedEntries = lines.map(line => {
          const parts = line.split('=');
          const word = parts[0]?.trim() || '';
          const translation = parts[1]?.trim() || '';
          return {
            language: 'Dinka',
            dialect: 'Standard',
            word,
            definition: translation,
            english_translation: translation,
            part_of_speech: 'noun',
            source: sourceName,
            license: licenseType,
          };
        });
      }

      const res = await fetch('/api/ingestion/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: parsedEntries,
          defaultSource: sourceName,
          defaultLicense: licenseType,
          defaultPriorityLevel: sourcePriority,
          copyrightConfirmed: true,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Ingestion failed');
      }

      setImportStatus({
        success: true,
        message: `Successfully ingested ${data.importedCount} normalized entries into the South Sudan Language Knowledge Base.`,
        count: data.importedCount,
        errors: data.errors
      });

      // Refresh listings
      loadData();
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: err.message || 'Failed to process linguistic resource'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(e => {
    const matchesLang = selectedLanguage === 'all' || e.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesPriority = selectedPriority === 'all' || e.sourcePriorityLevel === selectedPriority;
    const matchesQuery = !searchQuery || 
      e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.english_translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.dialect && e.dialect.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesPriority && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">South Sudan Language Knowledge Base</h1>
                <p className="text-xs text-sky-300/80">Digital Language Archive & Verified Ingestion Engine</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              JubaLingua AI does not rely exclusively on base LLM memory. We maintain an authoritative linguistic 
              knowledge base grounded in legally licensed dictionaries, academic grammars, the Dinka Digital Library, 
              the Nuer Lexicon, and community-verified field corpora.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Knowledge Base</span>
            </button>
          </div>
        </div>

        {/* Priority Hierarchy Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold truncate">Level 1: Native Verified</span>
          </div>
          <div className="p-2 rounded bg-sky-950/40 border border-sky-800/50 text-sky-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="font-semibold truncate">Level 2: Academic Archive</span>
          </div>
          <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span className="font-semibold truncate">Level 3: Established Lexicon</span>
          </div>
          <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold truncate">Level 4: Community Review</span>
          </div>
          <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span className="font-semibold truncate">Level 5: AI Hypothesis</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveSubTab('provenance')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'provenance'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Authoritative Provenance & Copyright ({datasets.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'pipeline'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Ingestion Pipeline & Normalizer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('entries')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'entries'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Verified Linguistic Entries ({entries.length})</span>
        </button>
      </div>

      {/* Subtab 1: Dataset Provenance Registry */}
      {activeSubTab === 'provenance' && (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-amber-200 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-1">Strict Copyright & Licensing Mandate:</p>
              <p className="text-amber-200/90 leading-relaxed">
                Do NOT scrape, copy, reproduce, or train on copyrighted dictionaries, books, or recordings unless 
                the license or rights explicitly permit that use. Every resource in this registry documents author, 
                organization, publication year, open license type, date accessed, and permitted computational scope.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((dataset) => (
              <div 
                key={dataset.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                      {dataset.language} {dataset.dialect ? `• ${dataset.dialect}` : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {dataset.license}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition">
                    {dataset.source}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dataset.authorOrganization}
                  </p>

                  <div className="mt-3 text-xs text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <p><span className="text-slate-500 font-medium">Publication:</span> {dataset.publication}</p>
                    <p><span className="text-slate-500 font-medium">Region:</span> {dataset.region}</p>
                    <p><span className="text-slate-500 font-medium">Copyright Status:</span> {dataset.copyrightStatus}</p>
                    <p><span className="text-slate-500 font-medium">Permitted Scope:</span> {dataset.permittedUse}</p>
                    <p><span className="text-slate-500 font-medium">Contributor / Panel:</span> {dataset.contributor}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dataset.verificationStatus}</span>
                  </span>
                  {dataset.url && (
                    <a
                      href={dataset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:underline"
                    >
                      <span>Digital Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Ingestion Pipeline & Normalizer */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-400" />
                <span>Linguistic Data Ingestion Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingest CSV, JSON, TEI XML, or linguistic wordlists into the normalized schema. 
                Data is validated, checked for copyright compliance, and indexed into the RAG retrieval engine.
              </p>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Load Pre-Configured Samples:</span>
              <button
                type="button"
                onClick={() => loadSampleTemplate('dinka')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs border border-slate-700"
              >
                + Dinka Digital Library Template
              </button>
              <button
                type="button"
                onClick={() => loadSampleTemplate('nuer')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-slate-700"
              >
                + Nuer Lexicon Template
              </button>
              <button
                type="button"
                onClick={() => loadSampleTemplate('bari')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs border border-slate-700"
              >
                + Bari Lexicon Template
              </button>
            </div>

            {/* Input Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payload Format</label>
                <select
                  value={payloadFormat}
                  onChange={(e: any) => setPayloadFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
                >
                  <option value="json">JSON Array of Entries</option>
                  <option value="csv">CSV (Comma Separated)</option>
                  <option value="tei_text">Linguistic Wordlist (Key=Value)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Authoritative Source Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. Dinka Digital Library, Nuer Lexicon"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">License</label>
                <input
                  type="text"
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. CC-BY-SA 4.0, Public Domain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Source Priority Level</label>
                <select
                  value={sourcePriority}
                  onChange={(e: any) => setSourcePriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
                >
                  <option value="Level 1: Native-speaker verified">Level 1: Native-speaker verified</option>
                  <option value="Level 2: Academic linguistic resource">Level 2: Academic linguistic resource</option>
                  <option value="Level 3: Established dictionary/lexicon">Level 3: Established dictionary/lexicon</option>
                  <option value="Level 4: Community-submitted and reviewed">Level 4: Community-submitted and reviewed</option>
                  <option value="Level 5: AI-generated hypothesis">Level 5: AI-generated hypothesis</option>
                </select>
              </div>
            </div>

            {/* Payload Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Data Payload to Ingest</label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Schema: language, dialect, word, lemma, definition, english_translation, part_of_speech, IPA, example_sentence
                </span>
              </div>
              <textarea
                rows={10}
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                placeholder="Paste JSON entries array, CSV lines, or wordlist..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
              />
            </div>

            {/* Copyright Checkpoint */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyrightConfirmed}
                  onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Copyright & Legal Compliance Certification:</strong> I hereby certify 
                  that this linguistic resource is legally accessible under Open Access, Creative Commons, Public Domain, 
                  or verified community consent. I confirm that no copyrighted books, proprietary databases, or commercial 
                  recordings are being illegally reproduced.
                </span>
              </label>
            </div>

            {/* Feedback message */}
            {importStatus && (
              <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                importStatus.success 
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200' 
                  : 'bg-rose-950/70 border border-rose-800 text-rose-200'
              }`}>
                {importStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{importStatus.message}</p>
                  {importStatus.errors && importStatus.errors.length > 0 && (
                    <ul className="list-disc pl-4 text-[11px] text-rose-300 space-y-0.5 mt-2">
                      {importStatus.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Ingestion Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleExecuteIngest}
                disabled={isImporting || !copyrightConfirmed}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating & Ingesting Dataset...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Execute Data Normalization & Ingestion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Verified Linguistic Entries Table */}
      {activeSubTab === 'entries' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search word, lemma, definition, or translation in verified archive..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Languages</option>
                <option value="Dinka">Dinka (6 Varieties)</option>
                <option value="Nuer">Nuer</option>
                <option value="Bari">Bari</option>
                <option value="Zande">Zande</option>
                <option value="Shilluk">Shilluk</option>
                <option value="Acholi">Acholi</option>
                <option value="Ma'di">Ma'di</option>
                <option value="Moru">Moru</option>
                <option value="Toposa">Toposa</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Priority Levels</option>
                <option value="Level 1: Native-speaker verified">Level 1: Native Verified</option>
                <option value="Level 2: Academic linguistic resource">Level 2: Academic</option>
                <option value="Level 3: Established dictionary/lexicon">Level 3: Dictionary</option>
                <option value="Level 4: Community-submitted and reviewed">Level 4: Community</option>
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Word / Lemma</th>
                    <th className="py-3 px-4">Language & Variety</th>
                    <th className="py-3 px-4">Definition & English Translation</th>
                    <th className="py-3 px-4">Phonetics (IPA)</th>
                    <th className="py-3 px-4">Evidence & Source Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{item.word}</div>
                        {item.lemma && item.lemma !== item.word && (
                          <div className="text-[10px] text-slate-500">Lemma: {item.lemma}</div>
                        )}
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">
                          {item.part_of_speech} {item.plural_form ? `• pl. ${item.plural_form}` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{item.language}</div>
                        <div className="text-[11px] text-slate-400">{item.dialect || 'Standard'}</div>
                        {item.region && (
                          <div className="text-[10px] text-slate-500">{item.region}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-white font-medium">{item.english_translation}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{item.definition}</div>
                        {item.example_sentence && (
                          <div className="text-sky-400/90 italic text-[11px] mt-1 bg-slate-950/60 p-1.5 rounded">
                            "{item.example_sentence}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {item.IPA ? (
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{item.IPA}</span>
                        ) : item.pronunciation ? (
                          <span>{item.pronunciation}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.sourcePriorityLevel?.includes('Level 1')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : item.sourcePriorityLevel?.includes('Level 2')
                              ? 'bg-sky-950 text-sky-300 border-sky-800'
                              : item.sourcePriorityLevel?.includes('Level 3')
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {item.sourcePriorityLevel || 'Level 2: Academic linguistic resource'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs" title={item.source}>
                          {item.source}
                        </div>
                        <div className="text-[9px] text-slate-500">License: {item.license}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No linguistic entries match the current filter query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
