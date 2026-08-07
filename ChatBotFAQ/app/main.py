"""Chatbot API + web UI for the BKFintech knowledge base.

    GET  /            chat interface
    POST /api/chat    {question, top_k?} -> SSE stream of the answer
    GET  /api/health  index size and model, for a quick sanity check

Retrieval runs first and its result is sent to the browser before the answer
starts streaming, so the sources are on screen while the model is still writing.

Run with:
    uvicorn app.main:app --reload --port 8000
"""
import json
import os
import re
import sys
import time
from collections import Counter
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Loaded by path, not by relying on cwd: `uvicorn app.main:app` is meant to work
# from any directory, and Answerer() below reads GEMINI_API_KEY at import time.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# The console is cp1252 on this machine, and every logged chunk is Vietnamese.
# Without this, printing a retrieval result raises UnicodeEncodeError *inside
# the request handler* and the answer never streams.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.services.chat_history import append_message, get_history
from app.services.llm import FREE_TIER_RPM, MODEL, TIMEOUT_MS, Answerer, MockAnswerer
from app.services.retriever import Retriever
from app.services.translator import ENABLED as TRANSLATE_ENABLED, QueryTranslator

STATIC_DIR = Path(__file__).resolve().parent / "static"

# 7 after reranking, not 7 straight off the vector search: the retriever pulls a
# band of 20 first and hybrid scoring decides which seven survive.
DEFAULT_TOP_K = int(os.environ.get("CHATBOT_TOP_K", "7"))

# Serve a fixed answer instead of calling the model. Retrieval is unaffected, so
# the UI can be exercised end to end without an API key or a token spend.
MOCK = os.environ.get("CHATBOT_MOCK", "") not in ("", "0", "false")

# Print what each question retrieved to the server console. On by default: a bad
# answer is nearly always a retrieval problem, and this is the only place the
# ranking is visible without re-running the query by hand.
LOG_CHUNKS = os.environ.get("CHATBOT_LOG_CHUNKS", "1") not in ("0", "false", "")
LOG_SNIPPET_CHARS = 120

# How many source links the footer may show. Kept small: the footer is a quick
# pointer to what the answer actually drew from, not a full source dump.
MAX_CITATION_LINKS = 2
CITATION_RE = re.compile(r"\[(\d+)\]")

app = FastAPI(title="BKFintech Chatbot")

# Loading the embedding model takes seconds and ~2GB of RAM, so both services
# are built once at import and reused across requests.
# Runs locally, so unlike the answerer it works in mock mode too — there is no
# API key involved.
translator = QueryTranslator() if TRANSLATE_ENABLED else None
retriever = Retriever(translator=translator)
# Answerer() resolves credentials in its constructor, so it must not be built
# at all in mock mode — that is the whole point of running without a key.
answerer = MockAnswerer() if MOCK else Answerer()


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=DEFAULT_TOP_K, ge=1, le=20)
    session_id: str = Field(min_length=1, max_length=200)


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def friendly_error(exc: Exception) -> str:
    """Say which of the two likely failures happened, in the user's language.

    The distinction matters: a timeout is worth retrying immediately, a quota
    error is not — waiting is the only thing that helps.
    """
    text = str(exc)
    if isinstance(exc, TimeoutError) or "timeout" in text.lower():
        return (f"Model không phản hồi trong {TIMEOUT_MS / 1000:.0f} giây. "
                "Nguồn tham khảo ở trên vẫn đúng — thử hỏi lại.")
    if "429" in text or "RESOURCE_EXHAUSTED" in text:
        return (f"Đã chạm giới hạn {FREE_TIER_RPM} câu hỏi mỗi phút của gói "
                "miễn phí. Đợi khoảng một phút rồi hỏi lại.")
    return f"{type(exc).__name__}: {text[:200]}"


def log_retrieval(question: str, query_used: str, chunks: list[dict]):
    """Print the ranking to the console, one block per question.

    Shows the hybrid score alongside the two it was built from, because a chunk
    that ranks on `dense` and one that ranks on `lexical` fail in different ways
    and the combined number alone hides which happened.
    """
    if not LOG_CHUNKS:
        return

    print("\n" + "=" * 96)
    print(f"HỎI: {question}")
    if query_used and query_used != question:
        print(f"     tìm bằng: {query_used}")
    if not chunks:
        print("     (không đoạn nào vượt ngưỡng điểm)")
        print("=" * 96, flush=True)
        return

    print(f"{'#':>2}  {'điểm':>6} {'dense':>6} {'lex':>6}  {'nhóm':<11} chunk_id")
    print("-" * 96)
    for i, chunk in enumerate(chunks, start=1):
        # dense_score/lexical_score only exist once reranking has run; a single
        # candidate skips it, so fall back to the score that is always present.
        dense = chunk.get("dense_score", chunk["score"])
        lexical = chunk.get("lexical_score", 0.0)
        print(f"{i:>2}  {chunk['score']:>6.4f} {dense:>6.4f} {lexical:>6.4f}  "
              f"{str(chunk.get('collection'))[:11]:<11} {chunk['chunk_id']}")
        print(f"    {chunk['url']}")
        snippet = " ".join(chunk["raw"].split())[:LOG_SNIPPET_CHARS]
        print(f"    {snippet}…")
    print("=" * 96, flush=True)


def citation_links(answer_text: str, chunks: list[dict]) -> str:
    """Build a markdown footer for the up-to-`MAX_CITATION_LINKS` chunks the
    answer actually cited.

    Ranked by how often each [n] appears in the answer, not by retrieval
    score — the model can cite a lower-ranked chunk and ignore the top one, and
    the footer should reflect what was used, not what was fetched.
    """
    valid_ns = [int(n) for n in CITATION_RE.findall(answer_text) if 1 <= int(n) <= len(chunks)]
    if not valid_ns:
        return ""

    counts = Counter(valid_ns)
    first_seen = {}
    for n in valid_ns:
        first_seen.setdefault(n, len(first_seen))
    ranked = sorted(counts, key=lambda n: (-counts[n], first_seen[n]))

    # The [n] index is only for ranking, not for display — the footer is
    # meant to read as plain clickable links, not a renumbered citation list.
    lines = []
    for n in ranked[:MAX_CITATION_LINKS]:
        chunk = chunks[n - 1]
        title = (chunk.get("title") or "").strip() or chunk.get("url", "")
        lines.append(f"[{title}]({chunk.get('url', '')})")
    return "\n\n---\n" + "\n".join(lines)


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model": "mock (không gọi API)" if MOCK else MODEL,
        "chunks_indexed": retriever.store.index.ntotal,
        "default_top_k": DEFAULT_TOP_K,
        "mock": MOCK,
        "translate_query": translator is not None,
    }


@app.post("/api/chat")
def chat(request: ChatRequest):
    # Asked before search so it can be reported; the translator caches, so this
    # does not cost a second API call.
    query_used = retriever.query_for(request.question)
    chunks = retriever.search(request.question, top_k=request.top_k)
    # Logged before the stream opens, so the ranking is on the console even if
    # the model call then fails.
    log_retrieval(request.question, query_used, chunks)

    # Fetched once up front, alongside retrieval: the Answerer needs it before
    # the first token is generated, so there is no later point to fetch it at.
    history = get_history(request.session_id)

    def events():
        # Sources first: they are ready immediately and give the reader
        # something to look at while the answer generates.
        yield sse("sources", {
            "query_used": query_used if query_used != request.question else None,
            "sources": [
                {
                    "n": i,
                    "title": c.get("title"),
                    "url": c.get("url"),
                    "score": round(c["score"], 4),
                    "collection": c.get("collection"),
                }
                for i, c in enumerate(chunks, start=1)
            ]
        })

        if not chunks:
            # Not saved to history: this reply carries no information from the
            # knowledge base, so remembering it would only spend one of the
            # three Q&A slots on a turn with nothing for a later question to
            # refer back to.
            yield sse("delta", {"text": "Tôi không tìm thấy thông tin nào liên quan "
                                        "đến câu hỏi này trong dữ liệu của BKFintech."})
            yield sse("done", {})
            return

        started = time.monotonic()
        # MockAnswerer.stream() only ever echoes chunks — it has no notion of
        # conversation history, so history is passed to the real Answerer only.
        stream_args = (request.question, chunks) if MOCK else (request.question, chunks, history)
        answer_parts = []
        try:
            for text in answerer.stream(*stream_args):
                answer_parts.append(text)
                yield sse("delta", {"text": text})
        except Exception as exc:  # surface the failure in the UI instead of a dead stream
            # Also to the console: an error that only reaches the browser is
            # invisible the moment anyone debugs from the server side.
            elapsed = time.monotonic() - started
            print(f"    !! {type(exc).__name__} sau {elapsed:.1f}s: "
                  f"{str(exc)[:200]}", flush=True)
            yield sse("error", {"message": friendly_error(exc)})
            # Not saved: a half-formed or failed answer would poison the
            # context for every question asked after it in this session.
            return
        print(f"    trả lời xong sau {time.monotonic() - started:.1f}s", flush=True)
        answer_text = "".join(answer_parts)
        footer = citation_links(answer_text, chunks)
        if footer:
            # Not saved to history below: it carries no new information beyond
            # the [n] markers already in answer_text, so keeping it out saves a
            # history slot for turns that actually add context.
            yield sse("delta", {"text": footer})
        append_message(request.session_id, "user", request.question)
        append_message(request.session_id, "assistant", answer_text)
        yield sse("done", {})

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
