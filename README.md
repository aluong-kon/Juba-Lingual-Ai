# 🇸🇸 Nile AI

> **One AI. Many South Sudanese languages. Preserving language, connecting people.**

South Sudan Language AI is a multilingual AI platform designed to help people communicate, learn, and preserve the diverse languages of South Sudan.

The platform combines **language resources, dictionaries, linguistic datasets, community-verified knowledge, RAG (Retrieval-Augmented Generation), speech recognition, translation, and text-to-speech** to support languages such as **Dinka, Nuer, Bari, Shilluk, and Zande**, with a long-term goal of expanding across South Sudan's wider linguistic diversity.

---

## 🚀 Vision

South Sudan has a rich linguistic heritage, but many local languages have limited representation in modern digital technologies.

This project aims to build an AI-powered language infrastructure that can:

* 🌍 Translate between South Sudanese languages and widely used languages
* 🗣️ Understand spoken South Sudanese languages
* 🔊 Generate spoken translations and pronunciations
* 📚 Digitize and organize dictionaries and linguistic resources
* 🧠 Use verified linguistic knowledge to improve AI responses
* 🛡️ Preserve dialect differences instead of treating languages as homogeneous
* 👥 Allow native speakers and linguists to review and improve translations
* 💾 Create reusable language datasets for future research and applications

---

## 🌍 Supported Languages

### MVP

| Language     | Initial Focus                                 |
| ------------ | --------------------------------------------- |
| 🇸🇸 Dinka   | Dictionary, dialects, text, audio             |
| 🇸🇸 Nuer    | Lexicon, varieties, text, audio               |
| 🇸🇸 Shilluk | Lexicography and speech data                  |
| 🇸🇸 Bari    | Linguistic resources and community validation |
| 🇸🇸 Zande   | Linguistic resources and community validation |

The architecture is designed so additional South Sudanese languages can be added without rebuilding the entire platform.

---

## 🧠 How It Works

```text
                USER
                 │
          ┌──────▼──────┐
          │ Web / Mobile│
          │    App      │
          └──────┬──────┘
                 │
        ┌────────▼─────────┐
        │ Language / Voice │
        │     Detection    │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │ Hybrid Retrieval │
        │ Search + pgvector│
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │      RAG         │
        │ Verified Context │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │       LLM        │
        │ Translation / AI │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │ Text / Voice     │
        │     Response     │
        └──────────────────┘
```

The AI does not simply generate translations from memory.

Instead, it retrieves relevant linguistic evidence from the project's language database before generating a response.

---

## 📚 Data Sources

The project is designed around **verified and traceable language resources**.

Potential sources include:

* Dinka digital dictionaries and lexical resources
* Nuer lexicons
* Shilluk lexicographic datasets
* South Sudan linguistic resources from SIL
* Academic language datasets
* Speech recordings
* Community-contributed translations
* Native-speaker corrections
* Research publications and linguistic documentation

### Data principle

> **No language data should be added blindly.**

Every dataset should have information about:

* Source
* Language
* Dialect
* Contributor
* License
* Usage rights
* Verification status
* Translation confidence
* Audio consent where applicable

Copyrighted or restricted material will only be used where the project's rights and licenses permit it.

---

# 🗄️ Database Architecture

The project uses **Supabase + PostgreSQL + pgvector**.

### Core tables

```text
languages
    │
    ├── dialects
    │
    ├── lexicon_entries
    │
    ├── sentences
    │
    └── audio_recordings

sources
    │
    ├── lexicon_entries
    ├── sentences
    ├── audio_recordings
    └── knowledge_chunks

knowledge_chunks
    │
    └── embeddings
```

### Example `languages`

```sql
id
name
endonym
iso_639_3
family
active
created_at
```

### Example `lexicon_entries`

```sql
id
language_id
dialect_id
source_id
lemma
normalized_form
english_definition
arabic_definition
part_of_speech
ipa
pronunciation
example_sentence
example_translation
confidence
verification_status
created_at
```

### Example `audio_recordings`

```sql
id
language_id
dialect_id
source_id
storage_path
transcript
translation
speaker_consent
sample_rate
duration_seconds
verification_status
created_at
```

---

# 🔎 RAG Pipeline

The platform uses Retrieval-Augmented Generation to reduce unsupported AI-generated language content.

### Pipeline

```text
User Input
    ↓
Language Detection
    ↓
Dialect Detection
    ↓
Intent Detection
    ↓
Exact Search
    +
Semantic Search
    ↓
Retrieve Verified Evidence
    ↓
Rank Sources
    ↓
Build Context
    ↓
LLM
    ↓
Confidence Check
    ↓
Response
```

### Retrieval priorities

The system prioritizes:

1. Same language
2. Same dialect
3. Verified native-speaker data
4. Expert-reviewed resources
5. Academic sources
6. Community contributions
7. General linguistic evidence

If sufficient evidence cannot be found, the AI should say so rather than inventing a translation.

---

# 🎙️ Voice Pipeline

The long-term goal is to allow users to **speak naturally instead of typing**.

```text
User Speech
    ↓
Voice Activity Detection
    ↓
Speech-to-Text
    ↓
Language Detection
    ↓
Dialect Detection
    ↓
RAG Retrieval
    ↓
AI Response
    ↓
Translation
    ↓
Text-to-Speech
    ↓
Spoken Response
```

Audio data will be stored separately from the main PostgreSQL database using object storage.

---

# 🧑🏾‍🤝‍🧑🏾 Community Verification

Language accuracy cannot depend entirely on AI.

The platform will include a human verification system where native speakers, linguists, and trusted community reviewers can:

* Correct translations
* Add missing words
* Identify dialect differences
* Verify pronunciation
* Report incorrect AI responses
* Add example sentences
* Review community submissions

Example workflow:

```text
Community Submission
        ↓
Initial Validation
        ↓
Native Speaker Review
        ↓
Linguist Review
        ↓
Approved
        ↓
Added to Trusted Knowledge
```

---

# 🔐 Security

Supabase Row Level Security (RLS) will protect application data.

### User roles

```text
user
native_reviewer
linguist
admin
```

### Permissions

| Role            | Read | Submit | Review | Admin |
| --------------- | ---: | -----: | -----: | ----: |
| User            |    ✅ |      ✅ |      ❌ |     ❌ |
| Native Reviewer |    ✅ |      ✅ |      ✅ |     ❌ |
| Linguist        |    ✅ |      ✅ |      ✅ |     ❌ |
| Admin           |    ✅ |      ✅ |      ✅ |     ✅ |

Trusted language data should not be directly editable by ordinary users.

---

# 🖥️ Planned Features

### Translation

* Text translation
* Language selection
* Dialect selection
* Translation history
* Source-backed translations

### Voice

* Speech input
* Speech recognition
* Spoken translations
* Pronunciation examples
* Text-to-speech

### Language Explorer

Users can explore:

* Words
* Definitions
* Pronunciation
* Example sentences
* Dialects
* Language history
* Related words

### Community

* Submit translations
* Suggest corrections
* Verify words
* Upload permitted recordings
* Report incorrect translations

### AI Chat

Users can ask questions about supported languages and receive answers grounded in the project's verified language resources.

---

# 🛠️ Technology Stack

### Frontend

* React / Next.js
* TypeScript
* Tailwind CSS

### Backend

* Supabase
* PostgreSQL
* Supabase Edge Functions

### AI

* Large Language Models
* Retrieval-Augmented Generation
* Embeddings
* pgvector

### Data

* PostgreSQL
* Vector search
* Full-text search
* Supabase Storage

### Voice

* Speech-to-Text
* Voice Activity Detection
* Text-to-Speech
* Language-specific speech models/providers

---

# 📁 Project Structure

```text
south-sudan-language-ai/
│
├── app/
│   ├── chat/
│   ├── translator/
│   ├── languages/
│   └── admin/
│
├── components/
│   ├── translator/
│   ├── voice/
│   ├── language/
│   └── ui/
│
├── lib/
│   ├── ai/
│   ├── rag/
│   ├── languages/
│   ├── supabase/
│   └── voice/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── data/
│   ├── dictionaries/
│   ├── lexicons/
│   ├── sentences/
│   └── metadata/
│
├── scripts/
│   ├── ingestion/
│   ├── cleaning/
│   └── embeddings/
│
├── docs/
│   ├── architecture.md
│   ├── data-sources.md
│   └── contribution.md
│
└── README.md
```

---

# 🗺️ Development Roadmap

## Phase 1 — Foundation

* [ ] Supabase project
* [ ] Database schema
* [ ] Authentication
* [ ] RLS policies
* [ ] Language and dialect tables
* [ ] Source registry
* [ ] Dinka data ingestion
* [ ] Nuer data ingestion

## Phase 2 — RAG

* [ ] Text normalization
* [ ] Full-text search
* [ ] Embeddings
* [ ] pgvector
* [ ] Hybrid retrieval
* [ ] RAG response generation
* [ ] Source citations
* [ ] Confidence handling

## Phase 3 — Translation App

* [ ] Language selector
* [ ] Dialect selector
* [ ] Translation interface
* [ ] Conversation history
* [ ] Language explorer

## Phase 4 — Voice

* [ ] Speech input
* [ ] Speech-to-text
* [ ] Audio processing
* [ ] Text-to-speech
* [ ] Pronunciation system
* [ ] Voice dataset pipeline

## Phase 5 — Community

* [ ] Native-speaker review
* [ ] Correction system
* [ ] Contributor profiles
* [ ] Verification workflow
* [ ] Moderation dashboard

## Phase 6 — Expansion

* [ ] Shilluk
* [ ] Bari
* [ ] Zande
* [ ] Additional South Sudanese languages
* [ ] More dialects
* [ ] Mobile application

---

# 🎯 MVP Goal

The first MVP will focus on a smaller, reliable language set rather than attempting to support every South Sudanese language immediately.

### Initial target

**Dinka + Nuer**

The MVP should demonstrate:

> **Type or speak → select language/dialect → retrieve verified linguistic knowledge → generate translation → hear the response.**

Once the underlying data and verification pipeline works reliably, additional languages can be added using the same architecture.

---

# 🤝 Contributing

Contributions are especially valuable from:

* Native speakers
* Linguists
* Researchers
* Software developers
* AI/ML engineers
* Data scientists
* Community organizations
* Language preservation projects

Before contributing language data, contributors should provide available information about its source, licensing, dialect, and consent.

---

# ⚖️ Data Ethics

This project is intended to support **language preservation, accessibility, education, and communication**.

We aim to:

* Respect community ownership and participation
* Protect speaker privacy
* Obtain consent for voice recordings
* Preserve dialect distinctions
* Attribute language resources appropriately
* Respect copyright and licensing
* Avoid presenting uncertain AI-generated translations as facts
* Keep humans involved in language verification

---

# 🌱 Long-Term Vision

The long-term goal is to create a reusable digital language infrastructure for South Sudan.

Instead of building one AI model that simply claims to know many languages, this project aims to build the foundation underneath it:

```text
LANGUAGE DATA
     ↓
DICTIONARIES
     ↓
CORPORA
     ↓
AUDIO
     ↓
DIALECT INFORMATION
     ↓
HUMAN VERIFICATION
     ↓
EMBEDDINGS
     ↓
RAG
     ↓
AI
     ↓
VOICE
```

This makes the system easier to improve, audit, and expand as new language resources become available.

---

# 🇸🇸 Built for South Sudan

**South Sudan Language AI**

*Technology for communication.
AI for preservation.
Language for everyone.*

---

## 📄 License

The software license and individual language-data licenses will be defined separately.

Language datasets may have different ownership, copyright, consent, and redistribution requirements. Each dataset must therefore retain its original licensing and attribution information.

---

## 👨🏾‍💻 Project

**South Sudan Language AI**

Built with a focus on **AI, data, language preservation, and community participation**.
