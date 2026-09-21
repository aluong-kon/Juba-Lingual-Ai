export type ValidationStatus = 
  | 'AI Generated' 
  | 'Community Reviewed' 
  | 'Native Speaker Verified' 
  | 'Expert Verified';

export type DatasetReadiness = 'validated' | 'provisional' | 'emerging' | 'limited' | 'in_development';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

export interface DialectInfo {
  id: string;
  name: string;
  nativeName?: string;
  region: string;
  communities: string[];
  notes?: string;
}

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  alternativeNames: string[];
  isoCode?: string;
  linguisticFamily: string; // e.g. "Nilotic (Western)", "Central Sudanic", "Ubangian"
  community: string;
  region: string;
  dialects: DialectInfo[];
  writingSystem: string;
  textSupport: boolean;
  speechRecognition: boolean;
  translation: boolean;
  textToSpeech: boolean;
  datasetStatus: 'rich' | 'moderate' | 'emerging' | 'limited';
  validationStatus: DatasetReadiness;
  verifiedPhrasesCount: number;
  audioRecordingsCount: number;
  sampleGreeting: string;
  sampleGreetingEn: string;
  culturalNotes?: string;
}

export interface VocabularyItem {
  id: string;
  languageId: string;
  dialect?: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  translationEn: string;
  translationAr?: string;
  culturalContext?: string;
  region?: string;
  verifiedBy?: string;
  verificationStatus: ValidationStatus;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface SentenceItem {
  id: string;
  languageId: string;
  dialect?: string;
  originalSentence: string;
  englishTranslation: string;
  arabicTranslation: string;
  audioUrl?: string;
  speakerId?: string;
  verified: boolean;
  verificationStatus: ValidationStatus;
  category?: string;
}

export interface WordBreakdown {
  word: string;
  translation: string;
  partOfSpeech: string;
}

export interface GroundedEvidence {
  lemma: string;
  source: string;
  priorityLevel: string;
  definition: string;
  ipa?: string;
  plural?: string;
  dialect?: string;
  license?: string;
}

export interface TranslationResponse {
  originalText: string;
  sourceLanguage: string;
  sourceDialect?: string;
  detectedLanguage?: string;
  targetLanguage: string;
  targetDialect?: string;
  translatedText: string;
  phoneticPronunciation?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  isUncertain: boolean;
  uncertaintyMessage?: string;
  culturalSafetyNotice?: string;
  dialectNotes?: string;
  vocabularyBreakdown?: WordBreakdown[];
  audioBase64?: string;
  audioMimeType?: string;
  needsNativeSpeakerValidation?: boolean;
  sourcePriorityLevel?: string;
  groundedEvidence?: GroundedEvidence;
  dinkaVarietyUsed?: string;
}

export interface EmergencyPhrase {
  id: string;
  category: 'medical' | 'water_food' | 'protection' | 'lost_family' | 'shelter' | 'registration';
  urgency: 'critical' | 'high' | 'standard';
  english: string;
  arabic: string;
  translations: Record<string, {
    text: string;
    phonetic: string;
    dialect?: string;
  }>;
  culturalNote?: string;
}

export interface CommunitySubmission {
  id: string;
  type: 'correction' | 'new_vocab' | 'audio_recording' | 'dialect_note' | 'report_issue';
  languageId: string;
  dialect?: string;
  sourceText: string;
  targetTranslation: string;
  pronunciation?: string;
  explanation: string;
  submittedBy: string;
  userRole: 'Community Member' | 'Native Speaker' | 'Linguist / Reviewer';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  votes: number;
  audioUrl?: string;
}

export interface ConversationTurn {
  id: string;
  speaker: 'Person A' | 'Person B';
  speakerName: string;
  languageId: string;
  dialect?: string;
  originalSpeechText: string;
  translatedText: string;
  targetLanguageId: string;
  phonetic?: string;
  timestamp: string;
  audioBase64?: string;
}

export interface LanguagePack {
  id: string;
  languageId: string;
  name: string;
  sizeMb: number;
  phrasesCount: number;
  vocabularyCount: number;
  downloaded: boolean;
  lastUpdated: string;
}

export type SourcePriorityLevel = 
  | 'Level 1: Native-speaker verified'
  | 'Level 2: Academic linguistic resource'
  | 'Level 3: Established dictionary/lexicon'
  | 'Level 4: Community-submitted and reviewed'
  | 'Level 5: AI-generated hypothesis';

export type DinkaVariety = 
  | 'Auto Detect'
  | 'South Central'
  | 'Southwestern'
  | 'Southeastern'
  | 'Northeastern'
  | 'Northwestern'
  | 'South Aliap';

export interface LinguisticDatasetProvenance {
  id: string;
  source: string;
  authorOrganization: string;
  publication: string;
  url?: string;
  license: string;
  copyrightStatus: string;
  dateAccessed: string;
  permittedUse: string;
  language: string;
  dialect?: string;
  region: string;
  contributor: string;
  verificationStatus: ValidationStatus | SourcePriorityLevel;
  entriesCount: number;
}

export interface IngestionEntry {
  id?: string;
  language: string;
  dialect?: string;
  word: string;
  lemma?: string;
  definition: string;
  english_translation: string;
  arabic_translation?: string;
  part_of_speech: string;
  plural_form?: string;
  verb_form?: string;
  example_sentence?: string;
  pronunciation?: string;
  IPA?: string;
  audio?: string;
  region?: string;
  source: string;
  license: string;
  confidence: number;
  verified: boolean;
  sourcePriorityLevel?: SourcePriorityLevel;
  evidenceType?: 'dictionary' | 'corpus' | 'linguistic_research' | 'community_validation';
}

export interface ConsentedSpeechRecording {
  id: string;
  language: string;
  dialect: string;
  speaker_consent: boolean;
  speaker_id: string;
  age_group: 'Youth (18-29)' | 'Adult (30-49)' | 'Elder (50+)' | 'Anonymous Native Speaker';
  region: string;
  phrase: string;
  transcription: string;
  translation: string;
  audio: string; // Base64 or local URL
  recording_quality: 'studio' | 'field_high' | 'field_moderate' | 'phone_audio';
  verified: boolean;
  category: 
    | 'alphabet/pronunciation'
    | 'numbers'
    | 'greetings'
    | 'common questions'
    | 'everyday conversation'
    | 'healthcare'
    | 'education'
    | 'agriculture'
    | 'business'
    | 'humanitarian assistance'
    | 'emergency communication';
  consentStatement: string;
  recordedDate: string;
  verifiedBy?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  language: string;
  languageId: string;
  word: string;
  ipa?: string;
  meaningEn: string;
  pos: string;
  family: string;
  verified: boolean;
  source: string;
  evidenceType: 'dictionary' | 'corpus' | 'linguistic_research' | 'community_validation';
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string; // Node id
  target: string; // Node id
  relationshipType: 'semantic_equivalent' | 'cognate_branch' | 'borrowing_loan' | 'dialect_variant';
  evidenceCitation: string;
  evidenceSource: string;
  confidence: number;
  verified: boolean;
}

export interface SemanticSynset {
  id: string;
  conceptKey: string;
  english: string;
  jubaArabic?: string;
  category: string;
  culturalNote?: string;
  translations: Record<string, {
    word: string;
    dialect?: string;
    ipa?: string;
    plural?: string;
    evidence: string;
    priorityLevel: SourcePriorityLevel;
  }>;
}

export interface LanguageCoverageStatus {
  language: string;
  languageId: string;
  dialects: string[];
  linguisticFamily: string;
  region: string;
  availableDictionary: 'Extensive' | 'Moderate' | 'Limited' | 'Fieldwork in Progress';
  availableCorpus: 'High' | 'Medium' | 'Initial' | 'None';
  availableAudio: 'Consented Archive' | 'Sample Recordings' | 'Community Sourced' | 'Needed';
  speechRecognition: 'Operational' | 'Experimental' | 'Dataset Needed';
  translation: 'Validated RAG' | 'Provisional RAG' | 'Under Documentation';
  textToSpeech: 'Synthetic Preview' | 'Native Samples' | 'Phonetic Fallback';
  humanVerification: 'Active Panel (3+ Validations)' | 'Peer Reviewed' | 'Recruiting Speakers';
  coveragePercent: number;
  notes: string;
}

export interface AdminMetrics {
  totalSupportedLanguages: number;
  totalVerifiedPhrases: number;
  totalAudioRecordings: number;
  translationAccuracyRate: number;
  communityValidationRate: number;
  mostUsedLanguages: { name: string; count: number }[];
  mostCommonRequests: { topic: string; count: number }[];
  pendingReviewsCount: number;
  errorReportsCount: number;
  ingestedDatasetsCount?: number;
  knowledgeGraphNodesCount?: number;
  knowledgeGraphEdgesCount?: number;
}
