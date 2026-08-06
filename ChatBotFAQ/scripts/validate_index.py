"""Sanity-check the FAISS index against the corpus it was built from.

Confirms the vector count matches the chunk count, breaks the corpus down by
source and language, then runs the questions a visitor is most likely to ask
and prints what retrieval actually returns — the point being to see whether the
right passage lands inside the top-k the chatbot will forward to the LLM.

Usage:
    python scripts/validate_index.py
    python scripts/validate_index.py --top-k 8
"""
import argparse
import sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.Data_embedding import DataEmbedding
from app.services.vector_store import VectorStore

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
INDEX_DIR = DATA_DIR / "faiss_index"

SAMPLE_QUERIES = [
    "What is BKFintech?",
    "Where is BKFintech located?",
    "Who is the Dean of the institute?",
    "What short-term courses are available?",
    "What is the ECOTECH conference?",
    "Quy mô kinh tế số Việt Nam tăng trưởng thế nào?",
]


def count_chunks() -> int:
    merged = DATA_DIR / "chunks_all.jsonl"
    paths = [merged] if merged.exists() else sorted(DATA_DIR.glob("chunks_*.jsonl"))
    total = 0
    for path in paths:
        with open(path, encoding="utf-8") as f:
            n = sum(1 for line in f if line.strip())
        print(f"  {path.name:22s} : {n}")
        total += n
    return total


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    print("Source chunk files:")
    expected = count_chunks()
    store = VectorStore.load(INDEX_DIR)

    print()
    print(f"total chunk entries  : {expected}")
    print(f"FAISS vectors        : {store.index.ntotal}")
    print(f"metadata entries     : {len(store.metadata)}")
    print("MATCH OK" if expected == store.index.ntotal == len(store.metadata) else "MISMATCH!")

    for label, key in (("collection", "collection"), ("domain", "domain"),
                       ("source", "source"), ("language", "lang")):
        counts = Counter(m.get(key) for m in store.metadata)
        if len(counts) == 1 and None in counts:
            continue
        print(f"\nchunks by {label} :")
        for name, count in counts.most_common():
            print(f"  {str(name):22s} {count}")

    embedder = DataEmbedding()
    print(f"\n--- Retrieval, top-{args.top_k} ---")
    for query in SAMPLE_QUERIES:
        print(f"\nQ: {query}")
        for i, r in enumerate(store.search(embedder.embed(query), top_k=args.top_k), start=1):
            print(f"  {i}. {r['score']:.4f} [{r['collection']}] {r['chunk_id']}")
            print(f"     {r['raw'][:120]}")


if __name__ == "__main__":
    main()
