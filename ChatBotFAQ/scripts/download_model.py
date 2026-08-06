"""Download the BGE-M3 weights into app/models/ before anything needs them.

`DataEmbedding()` already fetches and caches the model on first use, so this
script is not strictly required — but the download is 2.2GB and would otherwise
start silently in the middle of `build_index.py` or of a server boot, looking
like a hang. Running it up front makes the cost explicit and gets it out of the
way while the network is available.

Safe to re-run: it reports the cached copy and downloads nothing.

Usage:
    python scripts/download_model.py
"""
import sys
import time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.Data_embedding import DataEmbedding


def folder_size_mb(path: Path) -> float:
    return sum(f.stat().st_size for f in path.rglob("*") if f.is_file()) / 1024 / 1024


def main():
    model_path = Path(__file__).resolve().parents[1] / "app" / "models" / "BAAI" / "bge-m3"
    cached = model_path.exists()

    if cached:
        print(f"Model already cached at {model_path}")
    else:
        print("Downloading BAAI/bge-m3 (~2.2GB) — this runs once.")

    started = time.perf_counter()
    embedder = DataEmbedding()
    elapsed = time.perf_counter() - started

    vector = embedder.embed("BKFintech là gì?")
    print(f"Ready in {elapsed:.1f}s · {folder_size_mb(model_path):.0f} MB on disk")
    print(f"Embedding dimension: {vector.shape[0]}")
    if not cached:
        print(f"Cached to {model_path}")


if __name__ == "__main__":
    main()
