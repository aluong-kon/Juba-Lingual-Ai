"""Dinka speech service: speech recognition, translation and text-to-speech.

Models (downloaded from the Hugging Face Hub on first use):
- facebook/mms-tts-dik / mms-tts-dip   Dinka text-to-speech (Southwestern / Northeastern)
- facebook/mms-1b-all + dik/dip adapter Dinka speech recognition
- facebook/nllb-200-distilled-600M      English <-> Dinka (dik_Latn) translation
"""

import io
import json
import os
import re
import subprocess
import threading
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoProcessor,
    AutoTokenizer,
    VitsModel,
    Wav2Vec2ForCTC,
)

torch.set_num_threads(max(1, os.cpu_count() or 1))

VARIETIES = {"dik", "dip"}
TTS_REPOS = {"dik": "facebook/mms-tts-dik", "dip": "facebook/mms-tts-dip"}
ASR_REPO = os.environ.get("MMS_ASR_MODEL", "facebook/mms-1b-all")
MT_REPO = os.environ.get("NLLB_MODEL", "facebook/nllb-200-distilled-600M")
NLLB_CODES = {"english": "eng_Latn", "dinka": "dik_Latn"}
CORPUS_FILE = Path(os.environ.get("DINKA_CORPUS", Path(__file__).parent / "data" / "dinka_corpus.jsonl"))
ASR_SAMPLE_RATE = 16000

app = FastAPI(title="Nile AI Dinka speech service")
_load_lock = threading.Lock()
_tts: dict = {}
_asr: dict = {}
_mt: dict = {}


def _norm(text: str) -> str:
    return unicodedata.normalize("NFC", text).strip()


def _tokens(text: str) -> list[str]:
    return re.findall(r"\w+", _norm(text).lower())


class TranslationMemory:
    def __init__(self, path: Path):
        self.pairs: list[dict] = []
        self.exact: dict[str, dict[str, int]] = {"english": {}, "dinka": {}}
        self.index: dict[str, dict[str, list[int]]] = {"english": defaultdict(list), "dinka": defaultdict(list)}
        self.df: dict[str, Counter] = {"english": Counter(), "dinka": Counter()}
        if not path.exists():
            return
        with path.open(encoding="utf-8") as f:
            for line in f:
                pair = json.loads(line)
                i = len(self.pairs)
                self.pairs.append(pair)
                for lang, key in (("english", "en"), ("dinka", "dik")):
                    toks = _tokens(pair[key])
                    self.exact[lang].setdefault(" ".join(toks), i)
                    for t in set(toks):
                        self.index[lang][t].append(i)
                        self.df[lang][t] += 1

    def lookup(self, text: str, lang: str) -> dict | None:
        i = self.exact[lang].get(" ".join(_tokens(text)))
        return self.pairs[i] if i is not None else None

    def search(self, text: str, lang: str, k: int = 5) -> list[dict]:
        n = max(1, len(self.pairs))
        query = set(_tokens(text))
        scores: Counter = Counter()
        for t in query:
            postings = self.index[lang].get(t, [])
            if not postings or len(postings) > n * 0.2:
                continue
            weight = float(np.log(n / len(postings)))
            for i in postings:
                scores[i] += weight
        results = []
        for i, score in scores.most_common(k * 4):
            key = "en" if lang == "english" else "dik"
            length_penalty = 1 + abs(len(_tokens(self.pairs[i][key])) - len(query)) / max(1, len(query))
            results.append((score / length_penalty, self.pairs[i]))
        results.sort(key=lambda r: -r[0])
        return [dict(pair, score=round(score, 3)) for score, pair in results[:k]]


memory = TranslationMemory(CORPUS_FILE)


def get_tts(variety: str):
    with _load_lock:
        if variety not in _tts:
            repo = TTS_REPOS[variety]
            _tts[variety] = (AutoTokenizer.from_pretrained(repo), VitsModel.from_pretrained(repo).eval())
    return _tts[variety]


def get_asr():
    with _load_lock:
        if "model" not in _asr:
            _asr["processor"] = AutoProcessor.from_pretrained(ASR_REPO)
            _asr["model"] = Wav2Vec2ForCTC.from_pretrained(ASR_REPO).eval()
            _asr["lang"] = None
    return _asr


def get_mt():
    with _load_lock:
        if "model" not in _mt:
            _mt["tokenizer"] = AutoTokenizer.from_pretrained(MT_REPO)
            _mt["model"] = AutoModelForSeq2SeqLM.from_pretrained(MT_REPO).eval()
    return _mt


def tts_text(text: str, vocab: dict) -> str:
    text = unicodedata.normalize("NFC", text.lower())
    text = re.sub(r"[.!?;:,]+", " - ", text)
    return " ".join("".join(ch if ch in vocab or ch == " " else " " for ch in text).split())


def decode_audio(data: bytes) -> np.ndarray:
    proc = subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(ASR_SAMPLE_RATE), "-f", "f32le", "pipe:1"],
        input=data,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise HTTPException(400, f"Could not decode audio: {proc.stderr.decode(errors='ignore')[:200]}")
    return np.frombuffer(proc.stdout, dtype=np.float32)


def translate_text(text: str, source: str, target: str) -> dict:
    match = memory.lookup(text, source)
    if match:
        return {
            "translation": match["dik" if target == "dinka" else "en"],
            "engine": "translation-memory",
            "source": match["source"],
        }
    mt = get_mt()
    tok, model = mt["tokenizer"], mt["model"]
    tok.src_lang = NLLB_CODES[source]
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", _norm(text)) if s]
    inputs = tok(sentences, return_tensors="pt", padding=True, truncation=True, max_length=256)
    with torch.inference_mode():
        out = model.generate(
            **inputs,
            forced_bos_token_id=tok.convert_tokens_to_ids(NLLB_CODES[target]),
            num_beams=4,
            max_new_tokens=256,
        )
    return {
        "translation": " ".join(tok.batch_decode(out, skip_special_tokens=True)),
        "engine": "nllb-200",
        "source": MT_REPO,
    }


class TTSRequest(BaseModel):
    text: str
    variety: str = "dik"


class TranslateRequest(BaseModel):
    text: str
    source: str
    target: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "loaded": {"tts": sorted(_tts), "asr": "model" in _asr, "translation": "model" in _mt},
        "translationMemoryPairs": len(memory.pairs),
        "models": {"tts": TTS_REPOS, "asr": ASR_REPO, "translation": MT_REPO},
    }


@app.post("/warmup")
def warmup():
    get_mt()
    get_tts("dik")
    get_asr()
    return health()


@app.post("/tts")
def tts(req: TTSRequest):
    if req.variety not in VARIETIES:
        raise HTTPException(400, f"variety must be one of {sorted(VARIETIES)}")
    tok, model = get_tts(req.variety)
    text = tts_text(req.text, tok.get_vocab())
    if not text:
        raise HTTPException(400, "No speakable Dinka text")
    inputs = tok(text, return_tensors="pt")
    with torch.inference_mode():
        waveform = model(**inputs).waveform[0].numpy()
    buf = io.BytesIO()
    sf.write(buf, waveform, model.config.sampling_rate, format="WAV", subtype="PCM_16")
    return Response(buf.getvalue(), media_type="audio/wav")


@app.post("/asr")
def asr(file: UploadFile = File(...), variety: str = Form("dik")):
    if variety not in VARIETIES:
        raise HTTPException(400, f"variety must be one of {sorted(VARIETIES)}")
    audio = decode_audio(file.file.read())
    if audio.size < ASR_SAMPLE_RATE // 4:
        raise HTTPException(400, "Audio too short")
    state = get_asr()
    processor, model = state["processor"], state["model"]
    with _load_lock:
        if state["lang"] != variety:
            processor.tokenizer.set_target_lang(variety)
            model.load_adapter(variety)
            state["lang"] = variety
        inputs = processor(audio, sampling_rate=ASR_SAMPLE_RATE, return_tensors="pt")
        with torch.inference_mode():
            logits = model(**inputs).logits
    text = processor.decode(torch.argmax(logits, dim=-1)[0])
    return {"text": _norm(text), "variety": variety}


@app.post("/translate")
def translate(req: TranslateRequest):
    if req.source not in NLLB_CODES or req.target not in NLLB_CODES or req.source == req.target:
        raise HTTPException(400, "source/target must be 'english' and 'dinka'")
    if not req.text.strip():
        raise HTTPException(400, "text is required")
    return translate_text(req.text, req.source, req.target)


@app.get("/memory/search")
def memory_search(q: str, lang: str = "english", k: int = 5):
    if lang not in NLLB_CODES:
        raise HTTPException(400, "lang must be 'english' or 'dinka'")
    return {"results": memory.search(q, lang, min(k, 20))}
