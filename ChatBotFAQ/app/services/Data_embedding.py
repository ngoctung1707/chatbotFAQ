"""BGE-M3 embedding, exposing both representations the model already produces.

One forward pass yields a dense vector *and* a set of learned lexical weights.
The dense vector is what FAISS searches; the lexical weights are what reranking
uses to catch matches the dense vector misses — a page whose distinguishing term
appears in its title but not its body ranks poorly on semantics alone.

FlagEmbedding rather than sentence-transformers: the sparse head lives in
`sparse_linear.pt`, which `SentenceTransformer.save()` does not carry, so a
model cached through that path can only ever return dense vectors.
"""
from pathlib import Path

import numpy as np
from FlagEmbedding import BGEM3FlagModel

MODEL_DIR = Path(__file__).parent.parent / "models"


class DataEmbedding:
    def __init__(self, model_name: str = "BAAI/bge-m3", use_fp16: bool = False):
        self.model_name = model_name
        # cache_dir keeps the weights inside the project (and inside .gitignore)
        # instead of the user-wide HuggingFace cache.
        self.model = BGEM3FlagModel(
            model_name,
            cache_dir=str(MODEL_DIR),
            normalize_embeddings=True,
            use_fp16=use_fp16,
        )

    def _encode(self, sentences: list[str], sparse: bool, batch_size: int = 8):
        return self.model.encode(
            sentences,
            batch_size=batch_size,
            return_dense=True,
            return_sparse=sparse,
            return_colbert_vecs=False,
        )

    def embed(self, text: str) -> np.ndarray:
        """Dense vector only — what a plain FAISS lookup needs."""
        return self._encode([text], sparse=False)["dense_vecs"][0]

    def embed_query(self, text: str) -> tuple[np.ndarray, dict]:
        """Dense vector and lexical weights from a single forward pass.

        Reranking is nearly free precisely because of this: the query is encoded
        once for the search it was going to do anyway, and the lexical weights
        come along at no extra cost.
        """
        out = self._encode([text], sparse=True)
        return out["dense_vecs"][0], out["lexical_weights"][0]

    def embed_batch(self, texts: list[str], batch_size: int = 8):
        """Dense matrix plus one lexical-weight dict per text, for indexing."""
        out = self._encode(texts, sparse=True, batch_size=batch_size)
        return out["dense_vecs"], out["lexical_weights"]

    def lexical_score(self, query_weights: dict, doc_weights: dict) -> float:
        """Sum of weight products over the tokens the two share."""
        return float(self.model.compute_lexical_matching_score(query_weights, doc_weights))
