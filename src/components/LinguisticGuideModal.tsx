import React from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Compass, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface LinguisticGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinguisticGuideModal: React.FC<LinguisticGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Linguistic Architecture & Onboarding Guide</h3>
              <p className="text-xs text-slate-400">
                Ethical standards, dialect science, and community validation methodology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Crucial Clarification */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Principle 1: Language ≠ Ethnic Group (The "64 Tribes" Fallacy)</span>
            </div>
            <p>
              Popular discourse often claims South Sudan has "64 tribes" and therefore "64 languages." Linguistically, this is inaccurate. Some ethnic groups speak varieties that linguists classify as dialects of a single language family (e.g. Dinka dialect clusters: Rek, Padang, Agar, Bor; or Bari dialect clusters: Bari proper, Mundari, Pojulu, Kuku, Nyangwara, Kakwa). Conversely, some groups speak distinct endangered isolates.
            </p>
            <p className="font-semibold text-amber-200">
              JubaLingua AI relies on empirical linguistic research (phonology, syntax, mutual intelligibility), not sociopolitical classifications.
            </p>
          </div>

          {/* Section 2: Safe AI Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Linguistic Safeguards & Anti-Hallucination Policy</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">No Synthetic Inventions</span>
                <span>The AI is strictly prohibited from inventing vocabulary, morphemes, or grammatical rules. If a phrase is unsupported, it must explicitly state: <em>"I don't have enough verified data for this language yet."</em></span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">Explicit Uncertainty</span>
                <span>Whenever acoustic noise, rare terminology, or dialect ambiguities arise, the system marks translations with low confidence and flags them for native speaker review.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Verification Pipeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>The 5-Gate Onboarding Pipeline for New Languages</span>
            </h4>
            <ol className="space-y-2.5 list-decimal list-inside bg-slate-950 p-4 rounded-xl border border-slate-800">
              <li className="font-medium text-white">
                <strong>Linguistic Evidence Verification:</strong> Submit ISO 639-3 code, linguistic family classification, orthography standards, and mutual intelligibility documentation.
              </li>
              <li className="font-medium text-white">
                <strong>Core Lexicon & Grammar Schema:</strong> Minimum 500 verified core terms (Swadesh list + South Sudan humanitarian/cultural terms) vetted by native speakers.
              </li>
              <li className="font-medium text-white">
                <strong>Consented Acoustic Training Tokens:</strong> Minimum 20 hours of clean audio recorded with documented prior informed consent from native speakers representing multiple age groups and genders.
              </li>
              <li className="font-medium text-white">
                <strong>Dialect Cross-Validation:</strong> At least 3 independent community linguists must review and approve grammar rules and avoid dialect erasure.
              </li>
              <li className="font-medium text-white">
                <strong>Provisional Deployment with Continuous Feedback:</strong> The language is deployed with transparent confidence ratings, an active correction queue, and offline packet support.
              </li>
            </ol>
          </div>

          {/* Section 4: Ethics of Consent */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Indigenous Data Sovereignty & Consent</span>
            </h4>
            <p>
              Indigenous South Sudanese languages are the living cultural heritage of their communities. Voice recordings submitted to JubaLingua AI remain under community intellectual custody. Contributors can opt out, remove recordings, and maintain transparency over how their speech is utilized.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
