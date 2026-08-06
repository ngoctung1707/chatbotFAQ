import json
from pathlib import Path

import faiss
import numpy as np


class VectorStore:
    """FAISS-backed vector index with metadata kept alongside, in insertion order.

    Lexical weights are stored in their own file rather than folded into
    metadata.json: they are machine-readable noise (token id -> weight) that
    would bury the human-readable fields anyone opens that file to check.
    """

    def __init__(self, dim: int):
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.metadata: list[dict] = []
        self.lexical: list[dict] = []

    def add(self, vectors: np.ndarray, metadata: list[dict], lexical: list[dict] = None):
        if vectors.shape[0] != len(metadata):
            raise ValueError("vectors and metadata must have the same length")
        if lexical is not None and len(lexical) != len(metadata):
            raise ValueError("lexical and metadata must have the same length")
        self.index.add(np.ascontiguousarray(vectors, dtype="float32"))
        self.metadata.extend(metadata)
        self.lexical.extend(lexical if lexical is not None else [{}] * len(metadata))

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> list[dict]:
        query_vector = np.ascontiguousarray(query_vector, dtype="float32").reshape(1, -1)
        scores, indices = self.index.search(query_vector, top_k)
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            results.append({"score": float(score), "index": int(idx), **self.metadata[idx]})
        return results

    def lexical_for(self, row: int) -> dict:
        return self.lexical[row] if row < len(self.lexical) else {}

    def save(self, dir_path: Path):
        dir_path = Path(dir_path)
        dir_path.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(dir_path / "index.faiss"))
        # "index" mirrors the FAISS row id, and indent keeps the dump readable in an editor.
        records = [{"index": i, **m} for i, m in enumerate(self.metadata)]
        with open(dir_path / "metadata.json", "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        if any(self.lexical):
            # No indent: this one is never read by a human, and the weights are
            # numerous enough that pretty-printing multiplies the file size.
            with open(dir_path / "lexical.json", "w", encoding="utf-8") as f:
                json.dump([{k: round(float(v), 5) for k, v in w.items()}
                           for w in self.lexical], f)

    @classmethod
    def load(cls, dir_path: Path) -> "VectorStore":
        dir_path = Path(dir_path)
        index = faiss.read_index(str(dir_path / "index.faiss"))
        with open(dir_path / "metadata.json", encoding="utf-8") as f:
            metadata = json.load(f)
        store = cls(dim=index.d)
        store.index = index
        store.metadata = metadata
        # An index built before lexical weights existed still loads; reranking
        # just finds nothing to work with and falls back to dense order.
        lexical_path = dir_path / "lexical.json"
        if lexical_path.exists():
            with open(lexical_path, encoding="utf-8") as f:
                store.lexical = json.load(f)
        else:
            store.lexical = [{}] * len(metadata)
        return store
