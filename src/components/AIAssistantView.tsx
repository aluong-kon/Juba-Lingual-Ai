import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Loader2, 
  AlertTriangle,
  Languages,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { blobToBase64, speakWithBrowser, playBase64Audio } from '../utils/audioUtils';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioText?: string;
  timestamp: string;
  isEmergency?: boolean;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Salam / Mälɛ kɔn / Cïn baai! I am **Nile AI**, a conversational assistant for South Sudan.

I communicate in **Juba Arabic**, **Dinka**, **Nuer**, **Bari**, **Zande**, and **English**, matching the language you write or speak in.

You can ask me questions, speak directly in your mother tongue, or toggle **Emergency Mode** for direct medical, food, or registration action steps.`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [bilingualOutput, setBilingualOutput] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEmergency: isEmergencyMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          isEmergency: isEmergencyMode,
          bilingualOutput: bilingualOutput,
        }),
      });

      if (!response.ok) throw new Error('Assistant API error');
      const data = await response.json();

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: isEmergencyMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error retrieving linguistic insights. Please check connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Microphone recording for voice prompt
  const startVoiceInput = async () => {
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
        const base64 = await blobToBase64(audioBlob);

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64, mimeType: 'audio/webm' }),
        });
        const data = await res.json();
        if (data.transcription) {
          setInput(data.transcription);
          handleSendMessage(data.transcription);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play audio for key phrases mentioned in assistant reply
  const handlePlayText = async (text: string, msgId: string) => {
    setPlayingAudioId(msgId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageId: 'general' }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, data.mimeType || 'audio/mp3');
      } else {
        speakWithBrowser(text, 'en');
      }
    } catch (err) {
      speakWithBrowser(text, 'en');
    } finally {
      setPlayingAudioId(null);
    }
  };

  const quickPrompts = [
    { label: 'Juba Arabic: Ita kwayis?', query: 'Salam! Ita kwayis? Kif al-hal fi Juba?' },
    { label: 'Dinka: Cïn baai?', query: 'Cïn baai! Yïn a pial?' },
    { label: 'Nuer: Mälɛ kɔn!', query: 'Mälɛ kɔn! Ci jɛŋ bi ku?' },
    { label: 'Bari: Do kulyan nyon?', query: 'Do kulyan nyon?' },
    { label: 'Zande: Mo gbia re!', query: 'Mo gbia re ziazia!' },
    { label: 'Emergency: Medical Help', query: 'Emergency medical aid needed: where is the nearest doctor or hospital?' },
    { label: 'Emergency: Food/Water', query: 'Where is the emergency food ration and clean drinking water distribution point?' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header with Nile AI Branding & Verification Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Nile AI</h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Phase 1 Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">Juba Arabic • Dinka • Nuer • Bari • Zande • English</p>
          </div>
        </div>

        {/* Operational Controls: Emergency Mode & Responder Review */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              isEmergencyMode 
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle immediate medical, food, and registration emergency actions"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isEmergencyMode ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>Emergency Mode: {isEmergencyMode ? 'ACTIVE' : 'Off'}</span>
          </button>

          <button
            onClick={() => setBilingualOutput(!bilingualOutput)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
              bilingualOutput 
                ? 'bg-sky-950 text-sky-300 border-sky-700' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Include English translation alongside local language for field responders"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Responder Review</span>
          </button>
        </div>
      </div>

      {/* Emergency Mode Warning Banner when active */}
      {isEmergencyMode && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl px-4 py-2 text-xs text-rose-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>Emergency Mode Activated:</strong> Conversational framing is bypassed. Nile AI outputs immediate, actionable triage directives.</span>
          </div>
          <button 
            onClick={() => setIsEmergencyMode(false)}
            className="text-[11px] underline text-rose-300 hover:text-rose-100"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-sky-600 text-white' : 'bg-slate-800 text-sky-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-sky-600 text-white shadow-md'
                    : msg.isEmergency
                    ? 'bg-rose-950/40 border border-rose-800 text-slate-100 shadow-md'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-[13px]">{msg.text}</div>

                {/* Optional Listen Button for Assistant Replies */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 tabular-nums">{msg.timestamp}</span>
                    <button
                      onClick={() => handlePlayText(msg.text.slice(0, 150), msg.id)}
                      disabled={playingAudioId === msg.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-300 text-[11px] border border-slate-800 transition"
                      title="Listen to pronunciation"
                    >
                      {playingAudioId === msg.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-sky-400" />
                      )}
                      <span>Audio Pronounce</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 border border-slate-700">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Nile AI is processing your message...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.query)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 sm:p-3 flex items-center gap-2 shadow-lg shrink-0">
        <button
          onClick={isRecording ? stopVoiceInput : startVoiceInput}
          className={`p-2.5 rounded-full transition ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
          }`}
          title="Voice query"
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            isEmergencyMode 
              ? "Emergency request (medical, food, water, registration)..." 
              : "Ask or speak in Juba Arabic, Dinka, Nuer, Bari, Zande, or English..."
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
