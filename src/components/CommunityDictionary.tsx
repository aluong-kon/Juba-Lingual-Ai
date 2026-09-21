import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  PlusCircle, 
  Volume2, 
  CheckCircle2, 
  ThumbsUp, 
  AlertOctagon, 
  Sparkles, 
  Loader2,
  Tag
} from 'lucide-react';
import { VocabularyItem, SentenceItem, Language, ValidationStatus } from '../types';
import { speakWithBrowser } from '../utils/audioUtils';

interface CommunityDictionaryProps {
  languages: Language[];
  userRole: string;
  onOpenContributeModal: (prefill?: any) => void;
}

export const CommunityDictionary: React.FC<CommunityDictionaryProps> = ({
  languages,
  userRole,
  onOpenContributeModal,
}) => {
  const [activeView, setActiveView] = useState<'vocabulary' | 'sentences'>('vocabulary');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dictionary items
  const fetchDictionary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLanguage !== 'all') params.append('languageId', selectedLanguage);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());

      const res = await fetch(`/api/community/dictionary?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch dictionary');
      const data = await res.json();
      setVocabulary(data.items || []);
      setSentences(data.sentences || []);
    } catch (err) {
      console.error('Dictionary load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDictionary();
  }, [selectedLanguage, selectedStatus, searchQuery]);

  const handleUpvote = (id: string) => {
    setVocabulary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'Expert Verified':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            ★ Expert Verified
          </span>
        );
      case 'Native Speaker Verified':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
            ✓ Native Speaker Verified
          </span>
        );
      case 'Community Reviewed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            ● Community Reviewed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            AI Generated
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Community Linguistic Repository</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified vocabulary, sentences, and cultural notes contributed and vetted by native South Sudanese speakers.
          </p>
        </div>

        <button
          id="add-term-btn"
          onClick={() => onOpenContributeModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Contribute Term or Audio</span>
        </button>
      </div>

      {/* Filters Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search word, meaning, or cultural concept..."
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Languages</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Validation Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="Expert Verified">Expert Verified</option>
            <option value="Native Speaker Verified">Native Speaker Verified</option>
            <option value="Community Reviewed">Community Reviewed</option>
            <option value="AI Generated">AI Generated</option>
          </select>

          {/* View Toggle */}
          <div className="bg-slate-950 rounded-lg p-1 border border-slate-800 flex">
            <button
              onClick={() => setActiveView('vocabulary')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeView === 'vocabulary' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vocabulary
            </button>
            <button
              onClick={() => setActiveView('sentences')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                activeView === 'sentences' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sentences
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-xs">Fetching verified dataset records...</p>
        </div>
      ) : activeView === 'vocabulary' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabulary.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 text-xs italic">
              No vocabulary terms match your filter criteria.
            </div>
          ) : (
            vocabulary.map((item) => {
              const lang = languages.find((l) => l.id === item.languageId);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow hover:border-slate-700 transition"
                >
                  <div>
                    {/* Status & Language Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                        {lang?.name} {item.dialect ? `• ${item.dialect}` : ''}
                      </span>
                      {getStatusBadge(item.verificationStatus)}
                    </div>

                    {/* Word and part of speech */}
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{item.word}</h3>
                      <span className="text-[11px] text-slate-500 font-mono italic">
                        {item.partOfSpeech}
                      </span>
                    </div>

                    {/* Phonetic Pronunciation */}
                    {item.pronunciation && (
                      <div className="text-xs font-mono text-slate-400 mb-2">
                        [{item.pronunciation}]
                      </div>
                    )}

                    {/* Translations */}
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-2">
                      <div className="text-xs font-medium text-slate-200">
                        <span className="text-slate-500 mr-1.5">EN:</span>
                        {item.translationEn}
                      </div>
                      {item.translationAr && (
                        <div className="text-xs font-medium text-slate-300 font-arabic" dir="rtl">
                          <span className="text-slate-500 ml-1.5 font-sans" dir="ltr">AR:</span>
                          {item.translationAr}
                        </div>
                      )}
                    </div>

                    {/* Cultural Context */}
                    {item.culturalContext && (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        "{item.culturalContext}"
                      </p>
                    )}
                  </div>

                  {/* Footer with Upvotes, Verifier, and Audio Play */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => handleUpvote(item.id)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{item.upvotes}</span>
                    </button>

                    <button
                      onClick={() => speakWithBrowser(item.word, item.languageId)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-300 transition"
                      title="Pronounce"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </button>

                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {item.verifiedBy || 'Community'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Sentences View */
        <div className="space-y-3">
          {sentences.map((sent) => {
            const lang = languages.find((l) => l.id === sent.languageId);
            return (
              <div
                key={sent.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-sky-400">
                      {lang?.name} {sent.dialect ? `• ${sent.dialect}` : ''}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {sent.category || 'General'}
                    </span>
                    {getStatusBadge(sent.verificationStatus)}
                  </div>
                  <div className="text-base font-bold text-white">{sent.originalSentence}</div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 mr-1">English:</span> {sent.englishTranslation}
                  </div>
                  <div className="text-xs text-slate-400 font-arabic" dir="rtl">
                    <span className="text-slate-500 ml-1 font-sans" dir="ltr">Arabic:</span> {sent.arabicTranslation}
                  </div>
                </div>

                <button
                  onClick={() => speakWithBrowser(sent.originalSentence, sent.languageId)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs border border-slate-700 flex items-center gap-1.5 shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
