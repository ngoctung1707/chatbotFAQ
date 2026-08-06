"""Embed the consolidated corpus and build the FAISS index.

Usage:
    python scripts/build_index.py
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.Data_embedding import DataEmbedding
from app.services.vector_store import VectorStore

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
INDEX_DIR = DATA_DIR / "faiss_index"


def load_chunks(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def load_all_chunks() -> list[dict]:
    """Prefer the consolidated corpus; fall back to the per-source files.

    consolidate_chunks.py merges the ingesters and removes passages that appear
    in more than one of them. Globbing the per-source files instead would index
    those duplicates twice, so the merged file wins whenever it exists.
    """
    merged = DATA_DIR / "chunks_all.jsonl"
    if merged.exists():
        chunks = load_chunks(merged)
        print(f"Loaded {len(chunks)} chunks from {merged.name} (consolidated)")
        return chunks

    chunks = []
    for path in sorted(DATA_DIR.glob("chunks_*.jsonl")):
        part = load_chunks(path)
        print(f"Loaded {len(part):4d} chunks from {path.name}")
        chunks.extend(part)
    return chunks


def main():
    chunks = load_all_chunks()
    if not chunks:
        raise SystemExit(f"No chunks found in {DATA_DIR}")

    embedder = DataEmbedding()
    # The breadcrumb is part of what gets embedded; `raw` is what the LLM reads.
    texts = [c["content"] for c in chunks]
    # Both representations come out of one pass, so the lexical weights that
    # reranking needs cost nothing beyond the embedding run already required.
    vectors, lexical = embedder.embed_batch(texts)
    print(f"Embedded {len(texts)} chunks -> vectors shape {vectors.shape}, "
          f"{sum(len(w) for w in lexical)} lexical weights")

    store = VectorStore(dim=vectors.shape[1])
    store.add(vectors, chunks, lexical)
    store.save(INDEX_DIR)
    print(f"Saved FAISS index ({store.index.ntotal} vectors, dim={store.dim}) to {INDEX_DIR}")


if __name__ == "__main__":
    main()
