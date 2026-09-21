import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Filter, 
  Layers, 
  UserCheck, 
  AlertCircle, 
  PlusCircle, 
  FileAudio,
  Sparkles,
  Info
} from 'lucide-react';
import { ConsentedSpeechRecording, Language } from '../types';
import { blobToBase64, playBase64Audio } from '../utils/audioUtils';

interface ConsentedVoiceDatabaseProps {
  languages: Language[];
}

export const ConsentedVoiceDatabase: React.FC<ConsentedVoiceDatabaseProps> = ({ languages }) => {
  const [recordings, setRecordings] = useState<ConsentedSpeechRecording[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'browse' | 'record'>('browse');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Recording booth state
  const [recordLanguage, setRecordLanguage] = useState<string>('Dinka');
  const [recordDialect, setRecordDialect] = useState<string>('Southwestern (Rek)');
  const [speakerId, setSpeakerId] = useState<string>('SPK-SSD-014');
  const [ageGroup, setAgeGroup] = useState<string>('Adult (30-49)');
  const [speakerRegion, setSpeakerRegion] = useState<string>('Tonj / Warrap');
  const [phrase, setPhrase] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [category, setCategory] = useState<string>('greetings');
  const [consentStatement, setConsentStatement] = useState<string>(
    'I voluntarily consent to having my voice recording preserved in the South Sudan Linguistic Archive for digital language preservation, open educational use, and community translation.'
  );
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(false);
  const [isRecordingNow, setIsRecordingNow] = useState<boolean>(false);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = [
    'alphabet/pronunciation',
    'numbers',
    'greetings',
    'common questions',
    'everyday conversation',
    'healthcare',
    'education',
    'agriculture',
    'business',
    'humanitarian assistance',
    'emergency communication'
  ];

  const loadRecordings = async () => {
    try {
      const res = await fetch('/api/speech/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      console.error('Failed to load recordings:', err);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  // Filter recordings
  const filteredRecordings = recordings.filter(r => {
    const matchesLang = selectedLanguage === 'all' || r.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesQuery = !searchQuery || 
      r.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.speaker_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesCategory && matchesQuery;
  });

  // Audio recording handlers
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const b64 = await blobToBase64(blob);
        setRecordedAudioBase64(b64);
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecordingNow(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingNow) {
      mediaRecorderRef.current.stop();
      setIsRecordingNow(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  // Submit recorded voice
  const handleSaveRecording = async () => {
    if (!consentConfirmed) {
      setSaveStatus({ success: false, message: 'Explicit speaker consent must be certified.' });
      return;
    }
    if (!phrase.trim()) {
      setSaveStatus({ success: false, message: 'Please provide phrase text.' });
      return;
    }
    if (!recordedAudioBase64) {
      setSaveStatus({ success: false, message: 'Please record audio sample before submitting.' });
      return;
    }

    try {
      const res = await fetch('/api/speech/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: recordLanguage,
          dialect: recordDialect,
          speaker_consent: true,
          speaker_id: speakerId,
          age_group: ageGroup,
          region: speakerRegion,
          phrase,
          transcription: phrase,
          translation,
          audio: recordedAudioBase64,
          category,
          consentStatement,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to save recording');

      setSaveStatus({ success: true, message: 'Speech recording saved to verified digital archive!' });
      setPhrase('');
      setTranslation('');
      setRecordedAudioBase64(null);
      loadRecordings();
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message });
    }
  };

  const handlePlayRecording = (rec: ConsentedSpeechRecording) => {
    if (playingId === rec.id) {
      setPlayingId(null);
      return;
    }

    setPlayingId(rec.id);
    if (rec.audio) {
      playBase64Audio(rec.audio);
    }
    setTimeout(() => {
      setPlayingId(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Radio className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Consented Native Speech Archive</h1>
                <p className="text-xs text-sky-300/80">Ethically Sourced Acoustic Voice Database for South Sudan</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Every speech sample in this repository is recorded with verified native speaker consent. 
              Our acoustic data powers speech-to-text, pronunciation preservation, and conversational AI across 
              11 vital domains including healthcare, agriculture, emergency aid, and daily communication.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shrink-0">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {recordings.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Consented Audio Samples
            </div>
          </div>
        </div>

        {/* Consent Protection Pill */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Informed Consent Protocol:</strong> Recordings are cataloged with speaker ID, age bracket, regional variety, and voluntary consent statements. Commercial voice-cloning without consent is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'browse'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileAudio className="w-4 h-4" />
          <span>Browse Consented Voice Records ({recordings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'record'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Native Speaker Recording Booth</span>
        </button>
      </div>

      {/* Tab 1: Browse Recordings */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phrase, translation, speaker ID, or region..."
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
                <option value="Dinka">Dinka</option>
                <option value="Nuer">Nuer</option>
                <option value="Bari">Bari</option>
                <option value="Zande">Zande</option>
                <option value="Juba Arabic">Juba Arabic</option>
                <option value="Shilluk">Shilluk</option>
                <option value="Acholi">Acholi</option>
                <option value="Ma'di">Ma'di</option>
                <option value="Moru">Moru</option>
                <option value="Toposa">Toposa</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Domains (11)</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecordings.map(rec => (
              <div 
                key={rec.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                        {rec.language} ({rec.dialect})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.category}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Consented</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    "{rec.phrase}"
                  </h3>
                  <p className="text-xs text-sky-300/90 mt-1">
                    {rec.translation}
                  </p>

                  <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1 text-slate-300">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Speaker: <strong className="text-slate-300">{rec.speaker_id}</strong> ({rec.age_group})</span>
                      <span>Region: <strong className="text-slate-300">{rec.region}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                      "{rec.consentStatement}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handlePlayRecording(rec)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    {playingId === rec.id ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Playing Audio...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Listen to Native Voice</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] font-mono text-slate-500">
                    Quality: {rec.recording_quality}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Recording Booth */}
      {activeTab === 'record' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-sky-400" />
              <span>Native Speaker Recording Studio</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Contribute verified audio samples to build acoustic training data for South Sudanese speech recognition. 
              Explicit informed consent is required prior to recording.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
              <select
                value={recordLanguage}
                onChange={(e) => setRecordLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              >
                <option value="Dinka">Dinka (Thuɔŋjäŋ)</option>
                <option value="Nuer">Nuer (Thok Naath)</option>
                <option value="Bari">Bari (Kutuk na Bari)</option>
                <option value="Zande">Zande (Päzande)</option>
                <option value="Juba Arabic">Juba Arabic</option>
                <option value="Shilluk">Shilluk (Dhøg Cølø)</option>
                <option value="Acholi">Acholi (Lwo)</option>
                <option value="Ma'di">Ma'di</option>
                <option value="Moru">Moru</option>
                <option value="Toposa">Toposa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dialect / Variety</label>
              <input
                type="text"
                value={recordDialect}
                onChange={(e) => setRecordDialect(e.target.value)}
                placeholder="e.g. Rek, Bor, Agar, Lou, Tambura"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Functional Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Speaker Pseudonym / ID</label>
              <input
                type="text"
                value={speakerId}
                onChange={(e) => setSpeakerId(e.target.value)}
                placeholder="e.g. SPK-SSD-022"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age Bracket</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              >
                <option value="Youth (18-29)">Youth (18-29)</option>
                <option value="Adult (30-49)">Adult (30-49)</option>
                <option value="Elder (50+)">Elder (50+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State / Region</label>
              <input
                type="text"
                value={speakerRegion}
                onChange={(e) => setSpeakerRegion(e.target.value)}
                placeholder="e.g. Rumbek, Bentiu, Juba, Yambio"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Spoken Phrase (Original Orthography)</label>
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="e.g. Cïn baai? / Mälɛ kɛ ji / Kondoyasi"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">English Translation</label>
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="e.g. How is home? / Peace be with you"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Voluntary Native Speaker Consent:</strong> {consentStatement}
              </span>
            </label>
          </div>

          {/* Audio Recorder Controls */}
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={isRecordingNow ? stopRecordingAudio : startRecordingAudio}
                disabled={!consentConfirmed}
                className={`p-4 rounded-full transition shadow-lg ${
                  isRecordingNow
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30'
                    : 'bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50'
                }`}
              >
                {isRecordingNow ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <div className="text-xs">
                {isRecordingNow ? (
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    Recording speech in {recordLanguage}... Click again when finished.
                  </span>
                ) : recordedAudioBase64 ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ Audio sample captured! Ready to submit into digital archive.
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Confirm consent above, then click mic to record pronunciation.
                  </span>
                )}
              </div>
            </div>

            {recordedAudioBase64 && (
              <button
                type="button"
                onClick={() => playBase64Audio(recordedAudioBase64)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Playback</span>
              </button>
            )}
          </div>

          {saveStatus && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              saveStatus.success 
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200' 
                : 'bg-rose-950/70 border border-rose-800 text-rose-200'
            }`}>
              {saveStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveRecording}
              disabled={!consentConfirmed || !recordedAudioBase64 || !phrase.trim()}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition"
            >
              Deposit Recording to South Sudan Linguistic Archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
