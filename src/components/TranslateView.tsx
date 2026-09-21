import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Info, 
  ThumbsUp, 
  Flag, 
  Layers, 
  Loader2,
  BookOpen,
  Send
} from 'lucide-react';
import { Language, TranslationResponse } from '../types';
import { blobToBase64, playBase64Audio, speakWithBrowser } from '../utils/audioUtils';

interface TranslateViewProps {
  languages: Language[];
  lowBandwidth: boolean;
  userRole: string;
  onOpenContributionModal: (prefill?: { sourceText: string; languageId: string }) => void;
}

export const TranslateView: React.FC<TranslateViewProps> = ({
  languages,
  lowBandwidth,
  userRole,
  onOpenContributionModal,
}) => {
  const [sourceLangId, setSourceLangId] = useState<string>('auto');
  const [sourceDialectId, setSourceDialectId] = useState<string>('');
  const [targetLangId, setTargetLangId] = useState<string>('dinka');
  const [targetDialectId, setTargetDialectId] = useState<string>('');

  const [inputText, setInputText] = useState<string>('Cïn baai? Cïŋ nyoth ke pial.');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Audio Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Find currently selected languages
  const sourceLang = languages.find((l) => l.id === sourceLangId);
  const targetLang = languages.find((l) => l.id === targetLangId);

  // Handle language swapping
  const handleSwapLanguages = () => {
    if (sourceLangId === 'auto') return;
    const prevSource = sourceLangId;
    const prevTarget = targetLangId;
    setSourceLangId(prevTarget);
    setTargetLangId(prevSource);
    setSourceDialectId('');
    setTargetDialectId('');
    if (result) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  // Perform translation
  const handleTranslate = async (textOverride?: string) => {
    const textToUse = textOverride !== undefined ? textOverride : inputText;
    if (!textToUse.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToUse,
          sourceLang: sourceLangId === 'auto' ? undefined : sourceLangId,
          sourceDialect: sourceDialectId || undefined,
          targetLang: targetLangId,
          targetDialect: targetDialectId || undefined,
          lowBandwidth,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate text');
      }

      const data: TranslationResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Translation error:', err);
      setResult({
        originalText: textToUse,
        sourceLanguage: sourceLangId,
        targetLanguage: targetLangId,
        translatedText: 'Translation service encountered an error. Please try again.',
        confidence: 'uncertain',
        confidenceScore: 0.2,
        isUncertain: true,
        uncertaintyMessage: 'Network error or service interruption. Verify connectivity.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Start audio recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await handleAudioProcess(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to capture speech.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio recording for speech-to-text & auto translation
  const handleAudioProcess = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64 = await blobToBase64(audioBlob);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: 'audio/webm',
          contextLanguage: sourceLangId !== 'auto' ? sourceLangId : undefined,
        }),
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();

      if (data.transcription) {
        setInputText(data.transcription);
        if (sourceLangId === 'auto' && data.detectedLanguageId) {
          setSourceLangId(data.detectedLanguageId);
        }
        // Auto-run translation immediately
        await handleTranslate(data.transcription);
      }
    } catch (error) {
      console.error('Error recognizing speech:', error);
      alert('Could not transcribe audio. You may type directly in the text box.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Play audio response
  const handlePlayAudio = async () => {
    if (!result?.translatedText) return;
    setIsPlayingAudio(true);

    try {
      // Call server TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: result.translatedText,
          languageId: targetLangId,
        }),
      });

      const ttsData = await res.json();
      if (ttsData.audioBase64) {
        await playBase64Audio(ttsData.audioBase64, ttsData.mimeType || 'audio/mp3');
      } else {
        // Fallback to browser SpeechSynthesis
        speakWithBrowser(result.translatedText, targetLangId);
      }
    } catch (err) {
      console.warn('TTS playback note:', err);
      speakWithBrowser(result.translatedText, targetLangId);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sample quick phrases for fast testing
  const samplePhrases = [
    { label: 'Health & Peace', text: 'Are you and your household in good health?' },
    { label: 'Where is Clinic?', text: 'Where is the nearest hospital or emergency clinic?' },
    { label: 'Safe Drinking Water', text: 'Where can our community collect clean drinking water?' },
    { label: 'Market Greeting', text: 'Greetings my brother, what is the price of grain today?' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Low Bandwidth Alert if active */}
      {lowBandwidth && (
        <div className="bg-amber-950/60 border border-amber-800/80 rounded-lg p-3 text-amber-200 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Low-Bandwidth Mode Active:</strong> Streamlined data payloads and compressed text definitions are prioritized to conserve mobile network data.
          </span>
        </div>
      )}

      {/* Main Translation Interface Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {/* Language Selection Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Source Language & Dialect */}
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                From Language
              </label>
              <select
                id="source-language-select"
                value={sourceLangId}
                onChange={(e) => {
                  setSourceLangId(e.target.value);
                  setSourceDialectId('');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="auto">✨ Auto Detect South Sudanese Language</option>
                <optgroup label="South Sudanese Indigenous Languages">
                  {languages.filter(l => l.id !== 'english' && l.id !== 'arabic_standard').map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cross-Border & Official">
                  <option value="english">English (Official)</option>
                  <option value="arabic_standard">Arabic (Modern Standard)</option>
                </optgroup>
              </select>
            </div>

            {/* Source Dialect (if available) */}
            {sourceLang && sourceLang.dialects && sourceLang.dialects.length > 0 && (
              <div className="w-full sm:w-48">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Source Dialect
                </label>
                <select
                  id="source-dialect-select"
                  value={sourceDialectId}
                  onChange={(e) => setSourceDialectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">General / All Dialects</option>
                  {sourceLang.dialects.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center items-center">
            <button
              id="swap-languages-btn"
              onClick={handleSwapLanguages}
              disabled={sourceLangId === 'auto'}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-200 transition shadow"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            </button>
          </div>

          {/* Target Language & Dialect */}
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                To Language
              </label>
              <select
                id="target-language-select"
                value={targetLangId}
                onChange={(e) => {
                  setTargetLangId(e.target.value);
                  setTargetDialectId('');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <optgroup label="South Sudanese Indigenous Languages">
                  {languages.filter(l => l.id !== 'english' && l.id !== 'arabic_standard').map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cross-Border & Official">
                  <option value="english">English (Official)</option>
                  <option value="arabic_standard">Arabic (Modern Standard)</option>
                </optgroup>
              </select>
            </div>

            {/* Target Dialect (if available) */}
            {targetLang && targetLang.dialects && targetLang.dialects.length > 0 && (
              <div className="w-full sm:w-48">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Target Dialect
                </label>
                <select
                  id="target-dialect-select"
                  value={targetDialectId}
                  onChange={(e) => setTargetDialectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">Standard / Central</option>
                  {targetLang.dialects.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Input & Output Split Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 min-h-[300px]">
          {/* Source Input Box */}
          <div className="p-4 flex flex-col justify-between space-y-3 bg-slate-900/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  {sourceLang ? `${sourceLang.name} (${sourceLang.nativeName})` : 'Auto-Detect Speech / Text'}
                </span>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText('');
                      setResult(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                id="source-input-textarea"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or speak a phrase from South Sudan (e.g., in Dinka, Nuer, Bari, Zande, Juba Arabic, English)..."
                className="w-full bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none resize-none text-base leading-relaxed"
              />
            </div>

            {/* Microphone & Voice Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Large Microphone Button */}
                <button
                  id="main-microphone-btn"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isTranscribing}
                  className={`relative flex items-center justify-center p-3 rounded-full transition-all shadow-lg ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30'
                      : isTranscribing
                      ? 'bg-amber-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                  title={isRecording ? 'Click to finish speaking' : 'Click to speak in any South Sudanese language'}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : isTranscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <div className="text-xs text-slate-400">
                  {isRecording ? (
                    <span className="text-red-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      Listening to spoken words...
                    </span>
                  ) : isTranscribing ? (
                    <span className="text-amber-400">Recognizing speech & language...</span>
                  ) : (
                    <span>Click mic to speak or paste text</span>
                  )}
                </div>
              </div>

              <button
                id="submit-translate-btn"
                onClick={() => handleTranslate()}
                disabled={isTranslating || !inputText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <span>Translate</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Target Output Box */}
          <div className="p-4 flex flex-col justify-between space-y-4 bg-slate-900/90">
            <div>
              {/* Output Header with Confidence Indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  {targetLang ? `${targetLang.name} (${targetLang.nativeName})` : 'Target Language'}
                </span>

                {result && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source Priority Badge */}
                    {result.sourcePriorityLevel && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          result.sourcePriorityLevel.includes('Level 1')
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : result.sourcePriorityLevel.includes('Level 2')
                            ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                            : result.sourcePriorityLevel.includes('Level 3')
                            ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                            : result.sourcePriorityLevel.includes('Level 4')
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-rose-950/80 text-rose-300 border-rose-800'
                        }`}
                      >
                        {result.sourcePriorityLevel.split(':')[0]}
                      </span>
                    )}

                    {/* Confidence Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        result.confidence === 'high'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : result.confidence === 'medium'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      {result.confidence === 'high'
                        ? '● High Confidence'
                        : result.confidence === 'medium'
                        ? '▲ Medium'
                        : '⚠ Unverified'}
                    </span>
                  </div>
                )}
              </div>

              {/* Translation Text Area */}
              {isTranslating ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin text-sky-400" />
                  <p className="text-xs">Querying South Sudan Linguistic Knowledge Base & RAG Evidence...</p>
                </div>
              ) : result ? (
                <div className="space-y-3">
                  {/* AI Hypothesis / Unverified Warning */}
                  {(result.isUncertain || result.needsNativeSpeakerValidation || result.sourcePriorityLevel?.includes('Level 5')) && (
                    <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-100">AI-Generated Hypothesis (Level 5):</strong>{' '}
                        {result.uncertaintyMessage || 'This translation is an AI-generated hypothesis and has not yet been verified in the South Sudan Linguistic Archive. Never present as verified fact until validated by native speakers.'}
                      </div>
                    </div>
                  )}

                  {/* Primary Translated Text */}
                  <div className="text-xl font-medium text-white leading-relaxed select-all">
                    {result.translatedText}
                  </div>

                  {/* Grounded RAG Evidence Card */}
                  {result.groundedEvidence && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-sky-800/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Verified Linguistic Knowledge Base Evidence</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {result.groundedEvidence.license || 'Open Access'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-500">Lemma / Word: </span>
                          <strong className="text-white">{result.groundedEvidence.lemma}</strong>
                        </div>
                        {result.groundedEvidence.ipa && (
                          <div>
                            <span className="text-slate-500">IPA: </span>
                            <span className="font-mono text-slate-300">{result.groundedEvidence.ipa}</span>
                          </div>
                        )}
                        {result.groundedEvidence.plural && (
                          <div>
                            <span className="text-slate-500">Plural: </span>
                            <span className="text-slate-300">{result.groundedEvidence.plural}</span>
                          </div>
                        )}
                        {result.groundedEvidence.dialect && (
                          <div>
                            <span className="text-slate-500">Variety: </span>
                            <span className="text-slate-300">{result.groundedEvidence.dialect}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        Definition: {result.groundedEvidence.definition}
                      </p>

                      <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                        Source: {result.groundedEvidence.source} ({result.groundedEvidence.priorityLevel})
                      </div>
                    </div>
                  )}

                  {/* Phonetic Pronunciation Guide */}
                  {result.phoneticPronunciation && (
                    <div className="text-xs bg-slate-950/80 p-2 rounded-md border border-slate-800 text-slate-300 font-mono">
                      <span className="text-slate-500 mr-2 font-sans font-semibold">Phonetic:</span>
                      {result.phoneticPronunciation}
                    </div>
                  )}

                  {/* Cultural Safety Notice */}
                  {result.culturalSafetyNotice && (
                    <div className="text-xs bg-sky-950/40 p-2.5 rounded-md border border-sky-800/50 text-sky-200 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{result.culturalSafetyNotice}</span>
                    </div>
                  )}

                  {/* Dialect Notes & Variety Used */}
                  {(result.dialectNotes || result.dinkaVarietyUsed) && (
                    <div className="text-xs text-slate-400 italic">
                      {result.dinkaVarietyUsed && result.dinkaVarietyUsed !== 'n/a' && (
                        <span className="text-sky-300 mr-2 font-semibold font-sans">
                          [{result.dinkaVarietyUsed} Variety]
                        </span>
                      )}
                      {result.dialectNotes && <span>Dialect Note: {result.dialectNotes}</span>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500 text-xs text-center italic">
                  Translated response will appear here with phonetics and cultural context notes.
                </div>
              )}
            </div>

            {/* Output Actions Bar */}
            {result && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {/* Play Audio Response */}
                  <button
                    id="play-translated-audio-btn"
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700 transition"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Listen Audio</span>
                      </>
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    id="copy-translation-btn"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Community Feedback Button */}
                <button
                  id="suggest-correction-btn"
                  onClick={() => onOpenContributionModal({
                    sourceText: inputText,
                    languageId: targetLangId
                  })}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-sky-300 transition"
                >
                  <ThumbsUp className="w-3 h-3 text-sky-400" />
                  <span>Suggest Native Correction</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vocabulary Breakdown (if available) */}
        {result?.vocabularyBreakdown && result.vocabularyBreakdown.length > 0 && (
          <div className="bg-slate-950 p-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Linguistic Breakdown & Lexical Roots</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.vocabularyBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 flex items-baseline gap-1.5"
                >
                  <span className="font-medium text-white">{item.word}</span>
                  <span className="text-[10px] text-slate-500 uppercase">({item.partOfSpeech})</span>
                  <span className="text-slate-400">→ {item.translation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Test Sample Prompts */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-400 mb-2">
          Test Quick Everyday South Sudanese Phrases:
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              id={`sample-phrase-${idx}`}
              onClick={() => {
                setInputText(phrase.text);
                handleTranslate(phrase.text);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {phrase.label}: <span className="text-slate-400">"{phrase.text}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
