"""Translate a Vietnamese question into English locally, before it is embedded.

The corpus is lopsided: every page that answers a question *about the institute*
— solutions, labs, staff, academic, home — is English, while the questions
arrive in Vietnamese. Searching English passages with an English query beats
relying on BGE-M3's cross-lingual alignment alone.

Runs on the machine, not through an API: Helsinki-NLP/opus-mt-vi-en converted to
CTranslate2 and quantised to int8. 74MB on disk, ~0.5s to load, ~110ms per
question — against a Gemini call that would spend a request from a free-tier
quota measured in requests per minute.

Only the *search* text is translated. The original question still goes to the
answering model, so the reply comes back in the language it was asked in.

**This model gets domain terms wrong**, measured on real questions:

    Ai là Viện trưởng?                    -> "Who's the Chief?"        (loses Viện)
    Chứng chỉ khóa Fintech...?            -> "Fintech's key certificate" (khóa = key)
    Quy mô kinh tế số Việt Nam...?        -> "the Vietnam economy"     (loses số)

Larger beams and context prefixes were tried and did not fix any of them. So the
retriever searches with *both* the original and the translation and keeps the
better match per chunk — a bad translation then costs one extra embedding and
nothing else, instead of replacing a good query with a wrong one.
"""
import os
import re
from functools import lru_cache
from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "models" / "opus-mt-vi-en-ct2"
ENABLED = os.environ.get("CHATBOT_TRANSLATE", "1") not in ("0", "false", "")

# Beam 2 rather than 5: measured identical output on the questions that matter
# and finishes sooner.
BEAM_SIZE = int(os.environ.get("CHATBOT_TRANSLATE_BEAM", "2"))

_SPECIAL = {"</s>", "<pad>", "<unk>", "<s>"}

# Characters that exist in Vietnamese and in almost nothing else written here.
_VIETNAMESE_CHARS = re.compile(r"[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếể"
                               r"ễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụỳýỷỹỵ]")

# Fallback for questions typed without diacritics ("khoa hoc nao phu hop").
# Short, high-frequency Vietnamese function words that are not English words.
_VIETNAMESE_WORDS = {
    "la", "cua", "co", "nao", "gi", "ai", "bao", "nhieu", "nhung", "va", "cho",
    "voi", "khi", "dau", "the", "khong", "duoc", "cac", "mot", "tai", "ve",
    "hoc", "vien", "trong", "lam", "sao", "tim", "muon", "hay", "phai",
}


def is_vietnamese(text: str) -> bool:
    if _VIETNAMESE_CHARS.search(text):
        return True
    words = re.findall(r"[a-z]+", text.lower())
    # Two hits, not one: "the" and "la" both appear in English sentences, so a
    # single match would send English questions off to be translated.
    return sum(1 for w in words if w in _VIETNAMESE_WORDS) >= 2


class QueryTranslator:
    """Lazy-loading vi->en translator. Construction is free; the model is read
    from disk on first use, so importing this costs nothing in mock mode."""

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.model_dir = Path(model_dir)
        self._engine = None

    @property
    def available(self) -> bool:
        return self.model_dir.exists()

    def _load(self):
        if self._engine is None:
            import ctranslate2
            import sentencepiece as spm

            self._engine = (
                ctranslate2.Translator(
                    str(self.model_dir),
                    device="cpu",
                    compute_type="int8",
                    # One replica, four threads: the box has four physical cores
                    # and BGE-M3 is already resident, so parallel replicas would
                    # contend rather than help.
                    inter_threads=1,
                    intra_threads=4,
                ),
                spm.SentencePieceProcessor(model_file=str(self.model_dir / "source.spm")),
                spm.SentencePieceProcessor(model_file=str(self.model_dir / "target.spm")),
            )
        return self._engine

    def to_english(self, question: str) -> str:
        """The English search text — the question itself when already English.

        Returning the original on any failure is deliberate: a translation
        problem should degrade retrieval, not break the chat.
        """
        if not ENABLED or not self.available or not is_vietnamese(question):
            return question
        try:
            return self._translate(question.strip()) or question
        except Exception:
            return question

    @lru_cache(maxsize=512)
    def _translate(self, question: str) -> str:
        translator, source, target = self._load()
        tokens = source.encode(question, out_type=str) + ["</s>"]
        result = translator.translate_batch(
            [tokens], beam_size=BEAM_SIZE, max_decoding_length=72
        )
        return target.decode([t for t in result[0].hypotheses[0] if t not in _SPECIAL])
