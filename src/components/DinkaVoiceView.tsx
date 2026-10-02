import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, Loader2, Radio, Send, Languages, AlertTriangle } from 'lucide-react';
import { blobToBase64, playBase64Audio } from '../utils/audioUtils';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';
type InputLanguage = 'dinka' | 'english';
type Variety = 'dik' | 'dip';

interface Turn {
  id: string;
  heard: string;
  heardEnglish: string;
  replyDinka: string;
  replyEnglish: string;
  translationEngine: string;
  audioBase64: string;
  mimeType: string;
}

interface VoiceStatus {
  available: boolean;
  translationMemoryPairs?: number;
  error?: string;
}

const SILENCE_RMS = 0.015;
const SILENCE_MS = 1500;
const MAX_LISTEN_MS = 12000;

const VARIETY_LABELS: Record<Variety, string> = {
  dik: 'Southwestern Dinka (Rek / Agar)',
  dip: 'Northeastern Dinka (Padang)',
};

export const DinkaVoiceView: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [inputLanguage, setInputLanguage] = useState<InputLanguage>('dinka');
  const [variety, setVariety] = useState<Variety>('dik');
  const [handsFree, setHandsFree] = useState<boolean>(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typed, setTyped] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceStatus | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef<boolean>(false);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;

  useEffect(() => {
    const refreshStatus = () =>
      fetch('/api/voice/status')
        .then((r) => r.json())
        .then(setStatus)
        .catch(() => setStatus({ available: false, error: 'Server unreachable' }));
    refreshStatus();
    const timer = setInterval(refreshStatus, 15000);
    return () => {
      clearInterval(timer);
      activeRef.current = false;
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
  };

  const history = () =>
    turnsRef.current.slice(-6).flatMap((t) => [
      { role: 'user', text: t.heardEnglish },
      { role: 'model', text: t.replyEnglish },
    ]);

  const runTurn = useCallback(
    async (payload: { audioBase64?: string; mimeType?: string; text?: string }) => {
      setPhase('thinking');
      setError(null);
      try {
        const res = await fetch('/api/voice/turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, inputLanguage, variety, history: history() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Voice assistant failed');

        const turn: Turn = { id: `turn-${Date.now()}`, ...data };
        setTurns((prev) => [...prev, turn]);
        setPhase('speaking');
        await playBase64Audio(turn.audioBase64, turn.mimeType);
        setPhase('idle');
        if (handsFree && activeRef.current) startListening();
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
        setPhase('idle');
        activeRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputLanguage, variety, handsFree],
  );

  const startListening = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      activeRef.current = true;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      let heardSpeech = false;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        cleanupAudio();
        if (!heardSpeech || chunks.length === 0) {
          setPhase('idle');
          activeRef.current = false;
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        await runTurn({ audioBase64: await blobToBase64(blob), mimeType: blob.type });
      };

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      const startedAt = performance.now();
      let lastLoud = startedAt;

      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const now = performance.now();
        if (rms > SILENCE_RMS) {
          heardSpeech = true;
          lastLoud = now;
        }
        const silentTooLong = heardSpeech && now - lastLoud > SILENCE_MS;
        const nothingSaid = !heardSpeech && now - startedAt > 6000;
        if (silentTooLong || nothingSaid || now - startedAt > MAX_LISTEN_MS) {
          if (recorder.state === 'recording') recorder.stop();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      recorder.start();
      setPhase('listening');
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      setError(`Microphone unavailable: ${err?.message || err}`);
      setPhase('idle');
      activeRef.current = false;
    }
  };

  const stopAll = () => {
    activeRef.current = false;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    cleanupAudio();
    setPhase('idle');
  };

  const onMicClick = () => {
    if (phase === 'listening') {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      return;
    }
    if (phase === 'idle') startListening();
  };

  const onSendTyped = async () => {
    const text = typed.trim();
    if (!text || phase !== 'idle') return;
    setTyped('');
    activeRef.current = false;
    await runTurn({ text });
  };

  const replay = async (turn: Turn) => {
    if (phase !== 'idle') return;
    setPhase('speaking');
    try {
      await playBase64Audio(turn.audioBase64, turn.mimeType);
    } finally {
      setPhase('idle');
    }
  };

  const ringColor = {
    idle: 'from-sky-500 to-emerald-500',
    listening: 'from-rose-500 to-amber-500 animate-pulse',
    thinking: 'from-violet-500 to-sky-500',
    speaking: 'from-emerald-400 to-sky-400 animate-pulse',
  }[phase];

  const phaseLabel = {
    idle: inputLanguage === 'dinka' ? 'Tap and speak Dinka' : 'Tap and speak English',
    listening: 'Listening… (stops when you pause)',
    thinking: 'Thinking…',
    speaking: 'Speaking Dinka…',
  }[phase];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400" /> Nile Voice — Dinka Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Speak in Dinka or English. Nile listens, answers, and talks back in Dinka.
          </p>
        </div>
        <div
          id="dinka-voice-status"
          className={`text-xs px-3 py-1 rounded-full border ${
            status?.available
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/60 border-amber-800 text-amber-300'
          }`}
        >
          {status === null
            ? 'Checking Dinka speech engine…'
            : status.available
              ? `Dinka speech engine online • ${status.translationMemoryPairs?.toLocaleString() ?? 0} reference pairs`
              : 'Dinka speech engine offline'}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs">I will speak</span>
          <select
            id="dinka-voice-input-language"
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value as InputLanguage)}
            disabled={phase !== 'idle'}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2"
          >
            <option value="dinka">Dinka (Thuɔŋjäŋ)</option>
            <option value="english">English</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-slate-400 text-xs">Dinka voice</span>
          <select
            id="dinka-voice-variety"
            value={variety}
            onChange={(e) => setVariety(e.target.value as Variety)}
            disabled={phase !== 'idle'}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2"
          >
            {(Object.keys(VARIETY_LABELS) as Variety[]).map((v) => (
              <option key={v} value={v}>
                {VARIETY_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 mt-5">
          <input
            id="dinka-voice-hands-free"
            type="checkbox"
            checked={handsFree}
            onChange={(e) => setHandsFree(e.target.checked)}
            className="accent-emerald-500"
          />
          <span>Hands-free (keep listening after each reply)</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <button
          id="dinka-voice-mic"
          onClick={onMicClick}
          disabled={phase === 'thinking' || phase === 'speaking' || status?.available === false}
          className={`relative w-40 h-40 rounded-full p-1.5 bg-gradient-to-br ${ringColor} disabled:opacity-60 transition`}
          aria-label={phase === 'listening' ? 'Stop listening' : 'Start listening'}
        >
          <span className="flex items-center justify-center w-full h-full rounded-full bg-slate-950">
            {phase === 'thinking' ? (
              <Loader2 className="w-14 h-14 text-violet-300 animate-spin" />
            ) : phase === 'speaking' ? (
              <Volume2 className="w-14 h-14 text-emerald-300" />
            ) : phase === 'listening' ? (
              <Square className="w-12 h-12 text-rose-300" />
            ) : (
              <Mic className="w-14 h-14 text-sky-300" />
            )}
          </span>
        </button>
        <p id="dinka-voice-phase" className="text-sm text-slate-300">{phaseLabel}</p>
        {phase !== 'idle' && (
          <button onClick={stopAll} className="text-xs text-slate-400 underline underline-offset-4">
            Stop conversation
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm bg-rose-950/50 border border-rose-800 text-rose-200 rounded p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          id="dinka-voice-typed"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendTyped()}
          placeholder={inputLanguage === 'dinka' ? 'Or type in Dinka…' : 'Or type in English…'}
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
        />
        <button
          id="dinka-voice-send"
          onClick={onSendTyped}
          disabled={!typed.trim() || phase !== 'idle'}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-sm flex items-center gap-1"
        >
          <Send className="w-4 h-4" /> Ask
        </button>
      </div>

      <div className="space-y-3">
        {[...turns].reverse().map((t) => (
          <div key={t.id} className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="text-sm">
              <span className="text-slate-500 text-xs uppercase tracking-wide">You said</span>
              <p className="text-slate-200">{t.heard}</p>
              {t.heard !== t.heardEnglish && <p className="text-slate-500 text-xs italic">≈ {t.heardEnglish}</p>}
            </div>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-xs uppercase tracking-wide">Nile (Dinka)</span>
                <button
                  onClick={() => replay(t)}
                  disabled={phase !== 'idle'}
                  className="text-xs flex items-center gap-1 text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay
                </button>
              </div>
              <p className="text-lg text-white">{t.replyDinka}</p>
              <p className="text-slate-500 text-xs italic flex items-center gap-1">
                <Languages className="w-3 h-3" /> {t.replyEnglish} •{' '}
                {t.translationEngine === 'translation-memory' ? 'from reference corpus' : 'machine translated — unverified'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
