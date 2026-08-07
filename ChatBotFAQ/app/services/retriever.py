"""Retrieve the passages that should ground an answer.

The search is two-stage. FAISS finds a wide band of candidates on dense
similarity, then those candidates are rescored against the query's lexical
weights and only the best few survive. Both scores come from the *same* BGE-M3
forward pass over the question, so the second stage costs no model call at all —
which is why it is done here rather than with a cross-encoder. On this CPU a
cross-encoder over 20 candidates was measured at 3.6-32s depending on size;
this is a dictionary intersection.

What the lexical half buys: dense embeddings smooth away exact terms. The page
`/courses/ai-blockchain-fintech-for-beginners` never surfaced for "khóa học nào
phù hợp với người mới bắt đầu" even though its slug says *beginners*, because
the phrase appears in its title and not its prose. Lexical weights match the
token itself, so it can.

Three filters then apply, each because of a measured property of this corpus:

  * **Weak matches are dropped.** BGE-M3 cosine scores run about 0.60-0.78 for
    passages that answer the question; below ~0.35 the hits are unrelated. FAISS
    returns k results however poor the match, so without a floor an off-topic
    question still fills the prompt with confident-looking noise.

  * **One page cannot take every slot.** A long article contributes many chunks
    that all score alike, crowding out the short page that holds the answer.
    Capping per URL keeps the results spread across sources. Applied *after*
    reranking, so the cap trims the final ranking rather than the raw one.

  * **Over-fetch, then filter.** Both of the above remove hits, so the search
    asks for more than it needs and trims back.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.services.Data_embedding import DataEmbedding
from app.services.vector_store import VectorStore

DEFAULT_INDEX_DIR = Path(__file__).resolve().parents[2] / "data" / "faiss_index"

# Cosine floor. Measured on this index: answering passages score 0.60-0.78,
# unrelated ones fall well below this.
DEFAULT_MIN_SCORE = 0.35

# No single page may occupy more than this many of the final slots.
DEFAULT_MAX_PER_URL = 3

# How many candidates the dense stage hands to reranking. Wide enough to give
# the lexical half something to reorder, narrow enough that the score floor has
# usually already cut it below this anyway.
DEFAULT_CANDIDATES = 20

# Hybrid weights. Dense leads because it carries the meaning; lexical corrects
# it. Tune with scripts/tune_hybrid.py rather than by intuition.
DENSE_WEIGHT = float(os.environ.get("CHATBOT_DENSE_WEIGHT", "0.7"))
SPARSE_WEIGHT = float(os.environ.get("CHATBOT_SPARSE_WEIGHT", "0.3"))

# Words a user says when they mean "this institute" without naming it — this
# bot only ever serves one organization, so there is no ambiguity to resolve,
# just a name missing from the query that the corpus's own pages spell out in
# full. Kept short and reviewed by hand rather than inferred, since a wrong
# entry here silently pollutes every query that contains it.
INSTITUTE_ALIASES = ["viện", "trường"]
INSTITUTE_FULL_NAME = "Viện Công nghệ và Kinh tế số BK Fintech"


def expand_self_reference(question: str) -> str | None:
    """A second query variant with the institute's full name appended, for
    questions that refer to it only as "viện"/"trường".

    Returns None (rather than the question unchanged) when no alias is
    present, so callers can tell "nothing to add" apart from "added and it's
    a no-op" without a second check.
    """
    q = question.lower()
    if INSTITUTE_FULL_NAME.lower() in q:
        return None
    if any(alias in q for alias in INSTITUTE_ALIASES):
        return f"{question} {INSTITUTE_FULL_NAME}"
    return None


def _rescale(values: list[float]) -> list[float]:
    """Stretch a list onto 0..1. A flat list carries no ranking signal, so it
    becomes all zeros rather than an arbitrary order."""
    low, high = min(values), max(values)
    if high - low < 1e-9:
        return [0.0] * len(values)
    return [(v - low) / (high - low) for v in values]


class Retriever:
    def __init__(
        self,
        index_dir: Path = DEFAULT_INDEX_DIR,
        embedder: DataEmbedding = None,
        translator=None,
    ):
        self.store = VectorStore.load(index_dir)
        # Loading the model costs seconds and ~2GB, so it is created once and
        # shared; pass one in to reuse an existing instance.
        self.embedder = embedder or DataEmbedding()
        # Optional: pass a QueryTranslator to search English passages with an
        # English query. Left None by scripts that must not make API calls.
        self.translator = translator

    def query_for(self, question: str) -> str:
        """The text actually embedded — English if the question was translated.

        Public so callers can show it: a user seeing a Vietnamese question
        return English-looking matches deserves to know why, and it is the first
        thing to check when retrieval goes wrong.
        """
        return self.translator.to_english(question) if self.translator else question

    def search(
        self,
        question: str,
        top_k: int = 7,
        min_score: float = DEFAULT_MIN_SCORE,
        max_per_url: int = DEFAULT_MAX_PER_URL,
        candidates: int = DEFAULT_CANDIDATES,
        rerank: bool = True,
    ) -> list[dict]:
        # Search with the question and, when it was translated, with the English
        # version too. The local translator mangles domain terms often enough
        # ("Viện trưởng" -> "the Chief") that replacing the query outright would
        # sometimes lose a match the original would have found. Keeping both and
        # taking the better score per chunk can only add, never subtract.
        queries = [question]
        expanded = expand_self_reference(question)
        if expanded:
            queries.append(expanded)
        # Translate the expanded form when there is one: "viện" alone commonly
        # mistranslates to "hospital" (the more frequent sense in general text),
        # but with the institute's full name attached the translator has an
        # anchor and resolves it correctly.
        english = self.query_for(expanded or question)
        if english != question:
            queries.append(english)

        hits: dict[int, dict] = {}
        lexicals = []
        for text in queries:
            query_dense, query_lexical = self.embedder.embed_query(text)
            lexicals.append(query_lexical)
            for hit in self.store.search(query_dense, top_k=max(candidates, top_k)):
                if hit["score"] < min_score:
                    continue
                seen = hits.get(hit["index"])
                if seen is None or hit["score"] > seen["score"]:
                    hits[hit["index"]] = hit
        hits = sorted(hits.values(), key=lambda h: h["score"], reverse=True)[:candidates]

        if rerank and any(lexicals) and len(hits) > 1:
            for hit in hits:
                doc_lexical = self.store.lexical_for(hit["index"])
                hit["dense_score"] = hit["score"]
                # Best of both queries again: the Vietnamese one shares tokens
                # with the Vietnamese book chunks, the English one with the
                # English site pages. Neither covers both halves of the corpus.
                hit["lexical_score"] = max(
                    (self.embedder.lexical_score(q, doc_lexical) for q in lexicals),
                    default=0.0,
                ) if doc_lexical else 0.0
            # The two scores are not on the same scale — dense cosine sits
            # around 0.4-0.8 while a lexical match measures ~0.0-0.3, so adding
            # them raw lets dense decide everything and the weights mean
            # nothing. Both are stretched across the candidate set first, which
            # makes the weights a real ratio between the two signals.
            dense = _rescale([h["dense_score"] for h in hits])
            lexical = _rescale([h["lexical_score"] for h in hits])
            for hit, d, s in zip(hits, dense, lexical):
                hit["score"] = DENSE_WEIGHT * d + SPARSE_WEIGHT * s
            hits.sort(key=lambda h: h["score"], reverse=True)

        kept: list[dict] = []
        per_url: dict[str, int] = {}
        for hit in hits:
            url = hit.get("url") or ""
            if per_url.get(url, 0) >= max_per_url:
                continue
            per_url[url] = per_url.get(url, 0) + 1
            kept.append(hit)
            if len(kept) >= top_k:
                break
        return kept
