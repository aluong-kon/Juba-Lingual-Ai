import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  ArrowRight, 
  MessagesSquare, 
  RotateCcw, 
  Loader2, 
  User, 
  Sparkles,
  Play
} from 'lucide-react';
import { Language, ConversationTurn } from '../types';
import { blobToBase64, playBase64Audio, speakWithBrowser } from '../utils/audioUtils';

interface ConversationModeProps {
  languages: Language[];
  lowBandwidth: boolean;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({
  languages,
  lowBandwidth,
}) => {
  // Person A configuration
  const [personALangId, setPersonALangId] = useState<string>('nuer');
  const [personADialect, setPersonADialect] = useState<string>('Western Nuer');
  const [personAText, setPersonAText] = useState<string>('Ci jɛŋ bi ku? Tɛ̈ɛ̈th baai aacï pial?');

  // Person B configuration
  const [personBLangId, setPersonBLangId] = useState<string>('bari');
  const [personBDialect, setPersonBDialect] = useState<string>('Bari proper');
  const [personBText, setPersonBText] = useState<string>('Do kulyan nyon? Bayit na kany a par.');

  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      id: 'turn-1',
      speaker: 'Person A',
      speakerName: 'Person A (Nuer)',
      languageId: 'nuer',
      dialect: 'Western Nuer',
      originalSpeechText: 'Mälɛ kɔn! Kɔc ë baai aacï pial?',
      translatedText: 'Do kulyan nyon! Kulyan ti bayit a kwayis?',
      targetLanguageId: 'bari',
      phonetic: 'doh kool-YAHN nyohn! kool-YAHN tee bah-YEET ah kwa-YEES?',
      timestamp: '10:14 AM',
    },
    {
      id: 'turn-2',
      speaker: 'Person B',
      speakerName: 'Person B (Bari)',
      languageId: 'bari',
      dialect: 'Bari proper',
      originalSpeechText: 'Nan a kwayis ko bayit, do wöki kango?',
      translatedText: 'Ɣän a kwayis kɛ baai, ci wä nɛnɛ?',
      targetLanguageId: 'nuer',
      phonetic: 'YAN ah kwa-YEES keh BAH-ee, chee wah neh-NEH?',
      timestamp: '10:15 AM',
    }
  ]);

  const [activeRecordingSpeaker, setActiveRecordingSpeaker] = useState<'Person A' | 'Person B' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const personALang = languages.find((l) => l.id === personALangId);
  const personBLang = languages.find((l) => l.id === personBLangId);

  // Start recording for a specific speaker
  const startRecording = async (speaker: 'Person A' | 'Person B') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await processTurnAudio(speaker, audioBlob);
      };

      mediaRecorder.start();
      setActiveRecordingSpeaker(speaker);
    } catch (err) {
      console.error('Mic error:', err);
      alert('Microphone permission required for conversation mode.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && activeRecordingSpeaker) {
      mediaRecorderRef.current.stop();
      setActiveRecordingSpeaker(null);
    }
  };

  // Process speech audio from either speaker
  const processTurnAudio = async (speaker: 'Person A' | 'Person B', audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(audioBlob);
      const currentSourceLangId = speaker === 'Person A' ? personALangId : personBLangId;
      const currentTargetLangId = speaker === 'Person A' ? personBLangId : personALangId;

      // 1. Transcribe audio
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: 'audio/webm',
          contextLanguage: currentSourceLangId,
        }),
      });

      const transcribeData = await transcribeRes.json();
      const transcribedText = transcribeData.transcription || 'Spoken message recorded.';

      // 2. Translate directly to the other speaker's language
      await submitTurn(speaker, transcribedText);
    } catch (err) {
      console.error('Conversation turn error:', err);
      alert('Could not complete speech turn. You may type text directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit a turn via text or voice
  const submitTurn = async (speaker: 'Person A' | 'Person B', textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    setIsProcessing(true);

    const sourceLang = speaker === 'Person A' ? personALangId : personBLangId;
    const sourceDialect = speaker === 'Person A' ? personADialect : personBDialect;
    const targetLang = speaker === 'Person A' ? personBLangId : personALangId;
    const targetDialect = speaker === 'Person A' ? personBDialect : personADialect;

    try {
      const txRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSubmit,
          sourceLang,
          sourceDialect,
          targetLang,
          targetDialect,
          lowBandwidth,
        }),
      });

      const txData = await txRes.json();

      const newTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        speaker,
        speakerName: `${speaker} (${speaker === 'Person A' ? personALang?.name : personBLang?.name})`,
        languageId: sourceLang,
        dialect: sourceDialect,
        originalSpeechText: textToSubmit,
        translatedText: txData.translatedText,
        targetLanguageId: targetLang,
        phonetic: txData.phoneticPronunciation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTurns((prev) => [...prev, newTurn]);

      // Clear input
      if (speaker === 'Person A') setPersonAText('');
      else setPersonBText('');

      // Auto play response for the other person
      playTurnAudio(newTurn.translatedText, targetLang, newTurn.id);
    } catch (err) {
      console.error('Turn submission error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio for a turn
  const playTurnAudio = async (text: string, languageId: string, turnId: string) => {
    setPlayingTurnId(turnId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageId }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, data.mimeType || 'audio/mp3');
      } else {
        speakWithBrowser(text, languageId);
      }
    } catch (err) {
      speakWithBrowser(text, languageId);
    } finally {
      setPlayingTurnId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessagesSquare className="w-5 h-5 text-sky-400" />
            <span>Bilateral Cross-Language Conversation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time interactive dialogue between speakers of different South Sudanese communities with audio playback.
          </p>
        </div>

        <button
          onClick={() => setTurns([])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Conversation</span>
        </button>
      </div>

      {/* Dual Speaker Setup Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Person A Configuration */}
        <div className="bg-slate-900 border border-sky-900/60 rounded-xl p-4 shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              <span className="text-sm font-bold text-white">Person A</span>
            </div>
            <span className="text-xs text-sky-400 font-medium">{personALang?.nativeName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Language</label>
              <select
                id="person-a-lang-select"
                value={personALangId}
                onChange={(e) => setPersonALangId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-md p-2 focus:ring-1 focus:ring-sky-500"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dialect</label>
              <select
                id="person-a-dialect-select"
                value={personADialect}
                onChange={(e) => setPersonADialect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md p-2"
              >
                <option value="">General</option>
                {personALang?.dialects?.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Person A Microphone & Input */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="person-a-mic-btn"
              onClick={() => {
                if (activeRecordingSpeaker === 'Person A') stopRecording();
                else startRecording('Person A');
              }}
              disabled={isProcessing || (activeRecordingSpeaker !== null && activeRecordingSpeaker !== 'Person A')}
              className={`p-3 rounded-full transition shadow flex items-center justify-center ${
                activeRecordingSpeaker === 'Person A'
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
              title="Person A speaks"
            >
              {activeRecordingSpeaker === 'Person A' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 flex gap-1">
              <input
                type="text"
                value={personAText}
                onChange={(e) => setPersonAText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitTurn('Person A', personAText);
                }}
                placeholder={`Speak or type in ${personALang?.name}...`}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={() => submitTurn('Person A', personAText)}
                disabled={isProcessing || !personAText.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs rounded-md transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Person B Configuration */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-4 shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-bold text-white">Person B</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">{personBLang?.nativeName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Language</label>
              <select
                id="person-b-lang-select"
                value={personBLangId}
                onChange={(e) => setPersonBLangId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-md p-2 focus:ring-1 focus:ring-emerald-500"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dialect</label>
              <select
                id="person-b-dialect-select"
                value={personBDialect}
                onChange={(e) => setPersonBDialect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md p-2"
              >
                <option value="">General</option>
                {personBLang?.dialects?.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Person B Microphone & Input */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="person-b-mic-btn"
              onClick={() => {
                if (activeRecordingSpeaker === 'Person B') stopRecording();
                else startRecording('Person B');
              }}
              disabled={isProcessing || (activeRecordingSpeaker !== null && activeRecordingSpeaker !== 'Person B')}
              className={`p-3 rounded-full transition shadow flex items-center justify-center ${
                activeRecordingSpeaker === 'Person B'
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Person B speaks"
            >
              {activeRecordingSpeaker === 'Person B' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 flex gap-1">
              <input
                type="text"
                value={personBText}
                onChange={(e) => setPersonBText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitTurn('Person B', personBText);
                }}
                placeholder={`Speak or type in ${personBLang?.name}...`}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => submitTurn('Person B', personBText)}
                disabled={isProcessing || !personBText.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-md transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Loader Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-sky-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Detecting speech, transcribing, and generating translated audio response...</span>
        </div>
      )}

      {/* Conversation Flow Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Real-time Dialogue Log ({turns.length} messages)
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {turns.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No messages yet. Press the microphone under Person A or Person B to start speaking!
            </div>
          ) : (
            turns.map((turn) => {
              const isPersonA = turn.speaker === 'Person A';
              const targetLang = languages.find((l) => l.id === turn.targetLanguageId);
              const sourceLang = languages.find((l) => l.id === turn.languageId);

              return (
                <div
                  key={turn.id}
                  className={`p-4 rounded-xl border transition ${
                    isPersonA
                      ? 'bg-slate-950/80 border-sky-900/50 mr-6 sm:mr-16'
                      : 'bg-slate-950/80 border-emerald-900/50 ml-6 sm:ml-16'
                  }`}
                >
                  {/* Speaker Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isPersonA ? 'bg-sky-400' : 'bg-emerald-400'
                        }`}
                      ></span>
                      <span className="text-xs font-bold text-white">{turn.speakerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {turn.dialect || sourceLang?.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{turn.timestamp}</span>
                  </div>

                  {/* Flow: Original Speech -> Transcription -> Translation -> Audio */}
                  <div className="space-y-2.5 text-xs">
                    {/* 1. Original Speech / Transcription */}
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        1. Original Spoken Speech ({sourceLang?.name})
                      </span>
                      <p className="text-slate-200 text-sm font-medium">{turn.originalSpeechText}</p>
                    </div>

                    {/* Step indicator arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 rotate-90" />
                    </div>

                    {/* 2. Translation into other speaker's tongue */}
                    <div className={`p-3 rounded-lg border ${
                      isPersonA 
                        ? 'bg-sky-950/30 border-sky-800/60 text-sky-100' 
                        : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-100'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          2. AI Translation → For {isPersonA ? 'Person B' : 'Person A'} ({targetLang?.name})
                        </span>
                        
                        {/* Audio Replay Button */}
                        <button
                          onClick={() => playTurnAudio(turn.translatedText, turn.targetLanguageId, turn.id)}
                          disabled={playingTurnId === turn.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] border border-slate-700 transition"
                          title="Replay Audio"
                        >
                          {playingTurnId === turn.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                          ) : (
                            <Volume2 className="w-3 h-3 text-sky-400" />
                          )}
                          <span>Replay Audio</span>
                        </button>
                      </div>

                      <p className="text-base font-semibold text-white leading-snug">
                        {turn.translatedText}
                      </p>

                      {turn.phonetic && (
                        <div className="mt-1.5 text-[11px] font-mono text-slate-300/80">
                          <span className="text-slate-500 font-sans mr-1">Phonetic:</span>
                          {turn.phonetic}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
