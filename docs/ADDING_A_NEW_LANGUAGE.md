# How to Add a New South Sudanese Language to JubaLingua AI

This guide documents the scientific, community-driven, and technical process for adding a new language or dialect variety to **JubaLingua AI**.

---

## 1. Guiding Principles & Cultural Safety

1. **Linguistic Reality Over Stereotypes:**
   Never assume that "64 tribes" equates to 64 discrete languages. Communities like the Bari, Pojulu, Kakwa, Kuku, and Mundari share closely related Karo language varieties while celebrating distinct communal identities. Conversely, languages like Dinka (*Thuɔŋjäŋ*) and Nuer (*Thok Naath*) feature prominent regional dialect continuums (Rek, Padang, Agar, Bor; Western, Eastern Jikany, Lou).

2. **No Hallucinated Languages:**
   **Under no circumstances does JubaLingua AI claim support for a language or dialect without verified linguistic grounding.** If sufficient training or verification data is absent, the system explicitly reports:
   > *"I don't have enough verified data for this language yet."*
   and invites verified native speaker contributions.

3. **Consented Audio & Ethical AI:**
   All speech recordings require informed consent from speakers. Personal identifiable information (PII) is decoupled and stored only under non-reversible anonymous hashes (`speakers` table).

---

## 2. Onboarding Workflow (Phased Progression)

```text
Step 1: Linguistic Classification & ISO Registration
                     ↓
Step 2: Dialect Continuum & Orthography Definition
                     ↓
Step 3: Seed Vocabulary & Parallel Sentence Gathering
                     ↓
Step 4: Native Speaker Review & Verification Board
                     ↓
Step 5: Model Grounding & Confidence Calibration
                     ↓
Step 6: Provisional Deployment (Emergency & Common Phrases)
                     ↓
Step 7: Full General Availability & Offline Language Pack
```

### Stage 1: Linguistic Classification
Define the language schema in `src/data/languages.ts` (or PostgreSQL `languages` table):
- **Language Identifier:** (e.g. `lotuko`, `moru`, `madi`, `bongo`)
- **Native Autonym:** The name the community uses for its own language (e.g. *Otuho*, *Kala Moru*, *Mä'dï*).
- **Linguistic Phylum:** e.g. Central Sudanic, Nilotic Eastern, Ubangian, Surmic.
- **ISO 639-3 Code:** (e.g., `lot` for Otuho, `mgd` for Moru, `mhi` for Madi).
- **Orthography:** Specify character set (e.g., special vowels `ɛ`, `ɔ`, `ö`, `ä`, tone markings, implosives `'b`, `'d`).

### Stage 2: Community Council & Dialect Mapping
Consult native speaker associations, elders, and linguistics scholars:
- Identify major dialect varieties and where they are spoken.
- Example: Dinka has Rek (Warrap), Agar (Lakes), Bor (Jonglei), Padang (Upper Nile/Ruweng).
- Establish dialect differentiation rules to prevent one variety from being falsely imposed as "standard".

### Stage 3: Dataset Ingestion Minimums
Before moving from `in_development` to `provisional`:
- **Minimum 100 core vocabulary items** (body parts, family, numbers, nature, emergency).
- **Minimum 50 parallel sentences** in English and Juba Arabic.
- **Minimum 25 recorded audio pronunciations** by at least two distinct consented speakers.
- **Emergency Phrasebook complete** (medical, water, lost family, protection).

### Stage 4: Four-Tier Human Verification
Every entry moves through the quality pipeline:
1. `AI Generated` / `Community Contributed`: Initial draft.
2. `Community Reviewed`: At least 3 community members upvote with zero disputed flags.
3. `Native Speaker Verified`: A verified native speaker confirms phonetic naturalness and cultural nuance.
4. `Expert Verified`: A linguist or cultural board verifies orthographic standard and dialect tags.

### Stage 5: Offline Language Pack Compilation
Generate a downloadable `.json` pack containing:
- Pre-compiled phrasebook for instant offline lookups.
- Phonetic pronunciation guides.
- Compressed lightweight audio assets (or phoneme synthesis guide for low-bandwidth environments).

---

## 3. Contributing via the Platform UI

Users with the **Community Contributor** or **Native Speaker** role can contribute directly via the **Community Dictionary** and **Validation Portal** tabs:
1. Click **Submit Term / Phrase**.
2. Select target language and dialect.
3. Provide word, part of speech, English and Arabic equivalents, and optional voice recording.
4. Add cultural notes explaining any figurative meaning or polite honorifics.
