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
  BookOpen, 
  HelpCircle 
} from 'lucide-react';
import { blobToBase64, speakWithBrowser, playBase64Audio } from '../utils/audioUtils';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioText?: string;
  timestamp: string;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `**Mälɛ kɔn / Ita kwayis!** I am your **JubaLingua AI Assistant**.
I can help you communicate, translate, understand cultural context, and master pronunciation across South Sudanese languages and dialects (Juba Arabic, Dinka, Nuer, Bari, Zande, Shilluk, Acholi, and more).

Ask me questions like:
- *"How do I say 'How are you?' in Nuer?"*
- *"What is the customary way to greet elders in Dinka?"*
- *"Explain the difference between Bari proper and Kuku variety in Central Equatoria."*
- *"Teach me 5 essential phrases for working in Malakal or Bentiu."*`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) throw new Error('Assistant API error');
      const data = await response.json();

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    'How do I say "How are you?" in Nuer?',
    'What is the polite greeting for meeting elders in Dinka?',
    'What does "kwayis" mean in Juba Arabic and how is it used?',
    'Explain the difference between Bari proper and Kuku variety.',
    'How to say "Thank you for the meal" in Zande?',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">South Sudan Cultural & Linguistic Assistant</h2>
            <p className="text-xs text-slate-400">Ask translation queries, cultural etiquette, or dialect nuances</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-800 text-sky-300 border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Grounded with Linguistic Guardrails
        </span>
      </div>

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
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-[13px]">{msg.text}</div>

                {/* Optional Listen Button for Assistant Replies */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
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
                      <span>Pronounce Guide</span>
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
              <span>Analyzing linguistic rules, orthography, and cultural context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition"
          >
            {prompt}
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
          placeholder="Ask in English, Juba Arabic, or any South Sudanese language..."
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
