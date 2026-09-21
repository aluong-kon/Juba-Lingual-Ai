-- =============================================================================
-- JubaLingua AI — South Sudan Multilingual AI Database Schema (Supabase / Postgres)
-- Architecture: Multi-dialect, Community-Verified, Cultural Safety & Audio Consent
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'visitor',
  'community_contributor',
  'native_speaker',
  'community_reviewer',
  'linguist_expert',
  'admin'
);

CREATE TYPE verification_status AS ENUM (
  'ai_generated',
  'community_reviewed',
  'native_speaker_verified',
  'expert_verified'
);

CREATE TYPE dataset_readiness AS ENUM (
  'validated',
  'provisional',
  'emerging',
  'in_development'
);

CREATE TYPE confidence_level AS ENUM (
  'high',
  'medium',
  'low',
  'uncertain'
);

CREATE TYPE gender_category AS ENUM (
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
);

-- -----------------------------------------------------------------------------
-- 2. USERS & PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  role user_role DEFAULT 'community_contributor',
  primary_language_id TEXT,
  native_dialects TEXT[] DEFAULT '{}',
  region_state TEXT,
  reputation_score INTEGER DEFAULT 10,
  verified_contributions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. LANGUAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.languages (
  id TEXT PRIMARY KEY, -- e.g. 'dinka', 'nuer', 'juba_arabic', 'bari'
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  alternative_names TEXT[] DEFAULT '{}',
  iso_code VARCHAR(10),
  linguistic_family TEXT NOT NULL,
  primary_communities TEXT[] NOT NULL,
  regions TEXT[] NOT NULL,
  writing_system TEXT NOT NULL,
  has_text_support BOOLEAN DEFAULT true,
  has_speech_recognition BOOLEAN DEFAULT false,
  has_translation BOOLEAN DEFAULT true,
  has_text_to_speech BOOLEAN DEFAULT false,
  dataset_status TEXT DEFAULT 'moderate',
  validation_status dataset_readiness DEFAULT 'provisional',
  verified_phrases_count INTEGER DEFAULT 0,
  audio_recordings_count INTEGER DEFAULT 0,
  cultural_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. DIALECTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dialects (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  native_name TEXT,
  region TEXT NOT NULL,
  communities TEXT[] DEFAULT '{}',
  phonetic_characteristics TEXT,
  lexical_differences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. SPEAKERS TABLE (Anonymous & Consented Audio Contributors)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_speaker_code VARCHAR(32) UNIQUE NOT NULL,
  primary_language_id TEXT NOT NULL REFERENCES public.languages(id),
  primary_dialect_id TEXT REFERENCES public.dialects(id),
  gender gender_category DEFAULT 'prefer_not_to_say',
  age_group VARCHAR(20), -- e.g., '18-29', '30-49', '50+'
  origin_region TEXT,
  consent_for_ai_training BOOLEAN NOT NULL DEFAULT true,
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. VOCABULARY TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  dialect_id TEXT REFERENCES public.dialects(id),
  word TEXT NOT NULL,
  part_of_speech VARCHAR(50),
  phonetic_pronunciation TEXT,
  english_translation TEXT NOT NULL,
  arabic_translation TEXT,
  cultural_context TEXT,
  region TEXT,
  verification_status verification_status DEFAULT 'ai_generated',
  verified_by UUID REFERENCES public.users(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. PHRASES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  dialect_id TEXT REFERENCES public.dialects(id),
  original_sentence TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  arabic_translation TEXT,
  category VARCHAR(50) DEFAULT 'General',
  context_notes TEXT,
  audio_url TEXT,
  speaker_id UUID REFERENCES public.speakers(id),
  verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'ai_generated',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. TRANSLATIONS AUDIT TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_language_id TEXT NOT NULL REFERENCES public.languages(id),
  source_dialect_id TEXT REFERENCES public.dialects(id),
  target_language_id TEXT NOT NULL REFERENCES public.languages(id),
  target_dialect_id TEXT REFERENCES public.dialects(id),
  input_text TEXT NOT NULL,
  output_translation TEXT NOT NULL,
  confidence confidence_level DEFAULT 'medium',
  confidence_score NUMERIC(4, 3) DEFAULT 0.850,
  is_uncertain BOOLEAN DEFAULT false,
  model_identifier TEXT DEFAULT 'gemini-3.8-flash',
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. AUDIO RECORDINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id TEXT NOT NULL REFERENCES public.languages(id),
  dialect_id TEXT REFERENCES public.dialects(id),
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL,
  duration_seconds NUMERIC(6, 2),
  sample_rate INTEGER DEFAULT 24000,
  transcription TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verification_status verification_status DEFAULT 'community_reviewed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. COMMUNITY CORRECTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  language_id TEXT NOT NULL REFERENCES public.languages(id),
  dialect_id TEXT REFERENCES public.dialects(id),
  correction_type VARCHAR(50) NOT NULL, -- 'translation_fix', 'new_word', 'audio_pronunciation', 'offensive_report'
  original_text TEXT NOT NULL,
  proposed_text TEXT NOT NULL,
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  votes INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. VERIFICATION RECORDS (Audit Log for Reviewers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'vocabulary', 'phrase', 'audio', 'translation'
  entity_id UUID NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES public.users(id),
  previous_status verification_status NOT NULL,
  new_status verification_status NOT NULL,
  decision_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. LANGUAGE MODELS TABLE (Pluggable Model Architecture Registry)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.language_models (
  id VARCHAR(50) PRIMARY KEY, -- e.g. 'gemini-3.8-flash', 'mms-south-sudan-stt', 'vits-dinka-tts'
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'Gemini AI Studio', 'Coqui TTS', 'Whisper Custom Fine-tune'
  model_type VARCHAR(30) NOT NULL, -- 'llm_translation', 'stt', 'tts', 'lid'
  supported_language_ids TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  average_latency_ms INTEGER DEFAULT 450,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. TRANSLATION FEEDBACK TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.translation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id UUID REFERENCES public.translations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_accurate BOOLEAN,
  is_natural BOOLEAN,
  is_culturally_appropriate BOOLEAN,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 14. CONVERSATION HISTORY TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  speaker_label VARCHAR(30) NOT NULL, -- 'Person A', 'Person B'
  speaker_language_id TEXT NOT NULL REFERENCES public.languages(id),
  target_language_id TEXT NOT NULL REFERENCES public.languages(id),
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  phonetic_pronunciation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 15. LANGUAGE PACKS TABLE (Offline Bundles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.language_packs (
  id TEXT PRIMARY KEY, -- e.g. 'pack-dinka', 'pack-nuer'
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  pack_version VARCHAR(20) DEFAULT '1.0.0',
  size_mb NUMERIC(5, 2) NOT NULL,
  phrases_count INTEGER NOT NULL,
  vocabulary_count INTEGER NOT NULL,
  audio_included BOOLEAN DEFAULT true,
  bundle_url TEXT,
  checksum TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vocabulary_lang ON public.vocabulary(language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON public.vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON public.vocabulary(verification_status);
CREATE INDEX IF NOT EXISTS idx_phrases_lang ON public.phrases(language_id);
CREATE INDEX IF NOT EXISTS idx_translations_source_target ON public.translations(source_language_id, target_language_id);
CREATE INDEX IF NOT EXISTS idx_dialects_lang ON public.dialects(language_id);
CREATE INDEX IF NOT EXISTS idx_corrections_lang_status ON public.community_corrections(language_id, status);
CREATE INDEX IF NOT EXISTS idx_convo_session ON public.conversation_history(session_id);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_packs ENABLE ROW LEVEL SECURITY;

-- 1. Languages and Dialects: Public readable, Admin write
CREATE POLICY "Public can view validated languages"
  ON public.languages FOR SELECT USING (true);

CREATE POLICY "Admins can manage languages"
  ON public.languages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view dialects"
  ON public.dialects FOR SELECT USING (true);

-- 2. Vocabulary: Anyone can read, Authenticated users can insert, Reviewers can update status
CREATE POLICY "Public can view verified vocabulary"
  ON public.vocabulary FOR SELECT USING (true);

CREATE POLICY "Contributors can submit new vocabulary"
  ON public.vocabulary FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Native speakers and reviewers can update vocabulary"
  ON public.vocabulary FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('native_speaker', 'community_reviewer', 'linguist_expert', 'admin')
    )
  );

-- 3. Community Corrections: Anyone can submit, Reviewers can verify
CREATE POLICY "Contributors can submit corrections"
  ON public.community_corrections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view open corrections"
  ON public.community_corrections FOR SELECT USING (true);

CREATE POLICY "Reviewers can update correction statuses"
  ON public.community_corrections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('community_reviewer', 'linguist_expert', 'admin')
    )
  );

-- 4. Speakers: Anonymity protected, no private leak
CREATE POLICY "Public can view non-PII speaker data"
  ON public.speakers FOR SELECT USING (true);

-- 5. Language Packs: Public download
CREATE POLICY "Public can download language packs"
  ON public.language_packs FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------------------------
INSERT INTO public.languages (id, name, native_name, alternative_names, iso_code, linguistic_family, primary_communities, regions, writing_system, has_text_support, has_speech_recognition, has_translation, has_text_to_speech, dataset_status, validation_status, verified_phrases_count, audio_recordings_count)
VALUES
('juba_arabic', 'Juba Arabic', 'Arabi Juba', ARRAY['South Sudanese Arabic'], 'pga', 'Arabic Creole', ARRAY['Urban residents, nationwide'], ARRAY['Central Equatoria', 'Nationwide'], 'Latin & Arabic script', true, true, true, true, 'rich', 'validated', 420, 180),
('dinka', 'Dinka', 'Thuɔŋjäŋ', ARRAY['Jieng', 'Dheeng'], 'din', 'Nilotic (Western)', ARRAY['Jieng confederacy'], ARRAY['Bahr el Ghazal', 'Lakes', 'Warrap', 'Jonglei', 'Upper Nile'], 'Modified Latin alphabet', true, true, true, true, 'rich', 'validated', 380, 145),
('nuer', 'Nuer', 'Thok Naath', ARRAY['Naadh'], 'nus', 'Nilotic (Western)', ARRAY['Naath (Nuer)'], ARRAY['Unity State', 'Upper Nile', 'Jonglei'], 'Modified Latin alphabet', true, true, true, true, 'rich', 'validated', 350, 130),
('bari', 'Bari', 'Kutuk na Bari', ARRAY['Bari-Karo'], 'bfa', 'Nilotic (Eastern)', ARRAY['Bari', 'Pojulu', 'Kakwa', 'Kuku', 'Mundari'], ARRAY['Central Equatoria'], 'Latin alphabet', true, true, true, true, 'rich', 'validated', 310, 110),
('zande', 'Zande', 'Päzande', ARRAY['Azande'], 'zne', 'Niger-Congo (Ubangian)', ARRAY['Azande'], ARRAY['Western Equatoria'], 'Latin alphabet', true, true, true, true, 'moderate', 'validated', 260, 95)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.dialects (id, language_id, name, region, communities)
VALUES
('dinka_rek', 'dinka', 'Rek (Western Dinka)', 'Warrap / Tonj', ARRAY['Rek']),
('dinka_padang', 'dinka', 'Padang (Northern Dinka)', 'Ruweng / Upper Nile', ARRAY['Padang']),
('dinka_agar', 'dinka', 'Agar (Central Dinka)', 'Rumbek / Lakes State', ARRAY['Agar']),
('dinka_bor', 'dinka', 'Bor (Southeastern Dinka)', 'Bor / Jonglei', ARRAY['Bor', 'Twic']),
('nuer_western', 'nuer', 'Western Nuer (Liech)', 'Unity State / Bentiu', ARRAY['Leek', 'Dok', 'Bul']),
('nuer_eastern', 'nuer', 'Eastern Jikany', 'Nasir / Upper Nile', ARRAY['Jikany']),
('nuer_lou', 'nuer', 'Lou Nuer', 'Akobo / Jonglei', ARRAY['Lou']),
('bari_proper', 'bari', 'Bari Central', 'Juba County', ARRAY['Bari']),
('bari_mundari', 'bari', 'Mundari variety', 'Terekeka', ARRAY['Mundari']),
('bari_pojulu', 'bari', 'Pojulu variety', 'Lainya / Yei', ARRAY['Pojulu']),
('bari_kuku', 'bari', 'Kuku variety', 'Kajo-Keji', ARRAY['Kuku'])
ON CONFLICT (id) DO NOTHING;
