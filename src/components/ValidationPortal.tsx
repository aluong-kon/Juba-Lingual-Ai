import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Loader2, 
  Award,
  Volume2
} from 'lucide-react';
import { CommunitySubmission, Language } from '../types';
import { speakWithBrowser } from '../utils/audioUtils';

interface ValidationPortalProps {
  languages: Language[];
  userRole: string;
}

export const ValidationPortal: React.FC<ValidationPortalProps> = ({
  languages,
  userRole,
}) => {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/submissions');
      if (!res.ok) throw new Error('Failed to fetch pending reviews');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Pending load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (id: string, decision: 'approve' | 'reject') => {
    setReviewingId(id);
    try {
      const res = await fetch('/api/community/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: id,
          decision,
          reviewerRole: userRole,
          reviewerName: `${userRole} Panelist`,
        }),
      });

      if (!res.ok) throw new Error('Review failed');

      setFeedbackMessage(
        decision === 'approve'
          ? '✓ Submission verified and promoted to official dataset!'
          : 'Submission archived as rejected.'
      );

      // Remove from pending list
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Review error:', err);
      alert('Error updating submission.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Native Speaker & Linguistic Validation Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review community-submitted translations, phonetics, and dialect distinctions before inclusion into the official dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 font-medium">
            <Award className="w-4 h-4 text-sky-400" />
            <span>Active Reviewer: {userRole}</span>
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Submissions List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-xs">Loading pending community submissions...</p>
        </div>
      ) : submissions.filter((s) => s.status === 'pending').length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <Check className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Validation Queue Clean!</h3>
          <p className="text-xs max-w-md mx-auto text-slate-400">
            All submitted corrections, vocabulary, and phrases have been validated by native speakers and linguists.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.filter((s) => s.status === 'pending').map((sub) => {
            const lang = languages.find((l) => l.id === sub.languageId);
            return (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4 hover:border-slate-700 transition"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
                      {sub.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {lang?.name} ({sub.dialect || 'General'})
                    </span>
                    <span className="text-xs text-slate-500">• Contributed by {sub.submittedBy}</span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {sub.createdAt}
                  </span>
                </div>

                {/* Content Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Source Phrase / Standard Prompt
                    </span>
                    <p className="text-slate-300 font-medium text-sm">{sub.sourceText}</p>
                  </div>

                  <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Proposed South Sudanese Expression
                    </span>
                    <p className="text-emerald-200 font-bold text-sm">{sub.targetTranslation}</p>
                    {sub.pronunciation && (
                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        [{sub.pronunciation}]
                      </p>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                {sub.explanation && (
                  <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/60">
                    <span className="font-semibold text-slate-300">Linguistic Context / Explanation:</span> "{sub.explanation}"
                  </div>
                )}

                {/* Validation Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => speakWithBrowser(sub.targetTranslation, sub.languageId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Listen Pronunciation</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReview(sub.id, 'reject')}
                      disabled={reviewingId === sub.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleReview(sub.id, 'approve')}
                      disabled={reviewingId === sub.id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                    >
                      {reviewingId === sub.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
