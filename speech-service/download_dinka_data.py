"""Download openly licensed Dinka-English parallel text into data/dinka_corpus.jsonl.

The speech service loads this file as a translation memory: exact matches are
spoken verbatim, and close matches are returned as reference examples.
"""

import json
import unicodedata
from pathlib import Path

import pyarrow.parquet as pq
from huggingface_hub import hf_hub_download

OUT_DIR = Path(__file__).parent / "data"
OUT_FILE = OUT_DIR / "dinka_corpus.jsonl"

SOURCES = [
    {
        "repo": "michsethowusu/english-southwestern-dinka_sentence-pairs_mt560",
        "file": "data/train-00000-of-00001.parquet",
        "en": "eng",
        "dik": "dik",
        "license": "CC-BY-4.0",
        "domain": "religious",
    },
    {
        "repo": "dayomtechnologies/English-Nuer-Dinka-Health-Translation-Dataset",
        "file": "health_nuer_dinka_translations_paired_en_nus_din.json",
        "en": "english",
        "dik": "dinka",
        "license": "MIT",
        "domain": "health",
    },
]


def clean(text: str) -> str:
    return " ".join(unicodedata.normalize("NFC", str(text or "")).split())


def read_rows(path: str):
    if path.endswith(".parquet"):
        return pq.read_table(path).to_pylist()
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else data.get("data", [])


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seen = set()
    written = 0
    with OUT_FILE.open("w", encoding="utf-8") as out:
        for src in SOURCES:
            path = hf_hub_download(src["repo"], src["file"], repo_type="dataset")
            count = 0
            for row in read_rows(path):
                en, dik = clean(row.get(src["en"])), clean(row.get(src["dik"]))
                if not en or not dik or len(en) > 400 or (en.lower(), dik) in seen:
                    continue
                seen.add((en.lower(), dik))
                out.write(json.dumps({
                    "en": en,
                    "dik": dik,
                    "source": src["repo"],
                    "license": src["license"],
                    "domain": src["domain"],
                }, ensure_ascii=False) + "\n")
                count += 1
            print(f"{src['repo']}: {count} pairs")
            written += count
    print(f"Wrote {written} pairs to {OUT_FILE}")


if __name__ == "__main__":
    main()
