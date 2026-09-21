import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Check, 
  Loader2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { Language } from '../types';
import { blobToBase64 } from '../utils/audioUtils';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: Language[];
  userRole: string;
  prefill?: {
    sourceText?: string;
    languageId?: string;
  } | null;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  languages,
  userRole,
  prefill,
}) => {
  const [submissionType, setSubmissionType] = useState<'correction' | 'vocabulary' | 'phrase' | 'dialect_difference' | 'offensive_report'>('correction');
  const [languageId, setLanguageId] = useState<string>('dinka');
  const [dialect, setDialect] = useState<string>('');
  const [sourceText, setSourceText] = useState<string>('');
  const [correctedText, setCorrectedText] = useState<string>('');
  const [contributorName, setContributorName] = useState<string>('Native Speaker Contributor');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Audio recording
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (prefill) {
      if (prefill.sourceText) setSourceText(prefill.sourceText);
      if (prefill.languageId) setLanguageId(prefill.languageId);
      setSubmissionType('correction');
    }
  }, [prefill]);

  if (!isOpen) return null;

  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        const base64 = await blobToBase64(blob);
        setAudioBase64(base64);
      };

      mr.start();
      setIsRecording(true);
    } catch (e) {
      alert('Microphone access denied.');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/community/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: submissionType,
          languageId,
          dialect: dialect || undefined,
          sourceText: sourceText || correctedText,
          correctedText,
          contributorName: `${contributorName} (${userRole})`,
          reason,
          audioBase64,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSourceText('');
        setCorrectedText('');
        setReason('');
        setAudioBase64(null);
      }, 1800);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Could not submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Contribute Linguistic Knowledge</h3>
            <p className="text-xs text-slate-400">
              Help preserve and perfect South Sudanese languages through human validation
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Contribution Submitted!</h4>
            <p className="text-xs text-slate-400">
              Your submission has been queued for Native Speaker review. Once approved, it joins the official validated training dataset.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Type selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contribution Category</label>
              <select
                value={submissionType}
                onChange={(e: any) => setSubmissionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 focus:ring-1 focus:ring-sky-500"
              >
                <option value="correction">Suggest Correction for Translation</option>
                <option value="vocabulary">Submit New Vocabulary Term</option>
                <option value="phrase">Submit Full Verified Sentence</option>
                <option value="dialect_difference">Report Dialect Variation</option>
                <option value="offensive_report">Report Inappropriate / Offensive Result</option>
              </select>
            </div>

            {/* Language & Dialect */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Language</label>
                <select
                  value={languageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dialect / Variety</label>
                <input
                  type="text"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  placeholder="e.g. Rek, Western Nuer, Kuku..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                />
              </div>
            </div>

            {/* Source text */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Original English / Arabic / Prompt</label>
              <input
                type="text"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="What was the prompt or original phrase?"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
              />
            </div>

            {/* Proposed Native Text */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Accurate South Sudanese Translation / Word *
              </label>
              <textarea
                rows={2}
                required
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                placeholder="Write the native wording in appropriate Latin or indigenous orthography..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 resize-none"
              />
            </div>

            {/* Voice Audio Sample */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Attach Spoken Pronunciation (Optional)
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={isRecording ? stopRecordingAudio : startRecordingAudio}
                  className={`p-2 rounded-full transition ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <span className="text-slate-400">
                  {isRecording
                    ? 'Recording voice audio...'
                    : audioBase64
                    ? '✓ Voice recording attached'
                    : 'Click mic to record accurate native pronunciation'}
                </span>
              </div>
            </div>

            {/* Reason / Context */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cultural Context / Explanation</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this the preferred wording? (e.g. respectful greeting, elder context)"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
              />
            </div>

            {/* Contributor Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Name / Community Reference</label>
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !correctedText.trim()}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-2 shadow"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit to Queue</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
