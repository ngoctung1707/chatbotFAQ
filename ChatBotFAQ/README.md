# BKFintech Chatbot

Retrieval-grounded chat over the BKFintech knowledge base: the question is
embedded, the nearest chunks are pulled from FAISS, and those chunks plus the
question are sent to Gemini to answer from.

```
question ─┬─ vi→en (local, 74MB) ─┐
          └───────────────────────┴─embed(BGE-M3)─► FAISS (694) ─20─► hybrid
                                                                       │
                          answer + citations ◄── gemini-3.6-flash ◄────7
```

## Setup

```bash
pip install -r requirements.txt
python -m playwright install chromium     # pip does not fetch the browser binary
python scripts/download_model.py          # BGE-M3, ~2.2GB, cached in app/models/
```

`download_model.py` is optional in the sense that `DataEmbedding()` downloads the
weights the first time anything embeds. Run it anyway: otherwise a 2.2GB download
begins in the middle of an index build or a server boot and looks like a hang.

The vi→en translator (`app/models/opus-mt-vi-en-ct2/`, 74MB) **is** in the
repository, so a clone can search Vietnamese questions immediately. Only BGE-M3
is gitignored — at 2.2GB it is past what GitHub accepts, and it downloads itself.
To rebuild the translator from scratch:

```bash
python -m ctranslate2.converters.transformers \
  --model Helsinki-NLP/opus-mt-vi-en --quantization int8 \
  --output_dir app/models/opus-mt-vi-en-ct2 \
  --copy_files source.spm target.spm vocab.json tokenizer_config.json
```

The repository ships `data/chunks_all.jsonl`, so the index can be built without
re-crawling:

```bash
python scripts/build_index.py             # ~20 min on CPU for 694 chunks
python scripts/validate_index.py          # expect: MATCH OK
```

## Run

```bash
export GEMINI_API_KEY=...
uvicorn app.main:app --reload --port 8000
```

Open <http://localhost:8000>.

To see the retrieved passages without calling the model at all, start the server
with `CHATBOT_MOCK=1` — retrieval runs for real and the answer is replaced by the
text of the retrieved chunks. Or, from the command line:

```bash
python scripts/preview_prompt.py "bkfintech là gì?"
python scripts/preview_prompt.py "Ai là Viện trưởng?" --top-k 5 --full
```

## Evaluation

`scripts/evaluate_chatbot.py` scores answers with DeepEval — Answer Relevancy,
Faithfulness and Contextual Relevancy, all judged by Gemini. The free tier caps
**requests per minute** (15 on `gemini-3.5-flash-lite`, 5 on `gemini-3.6-flash`)
and the quota is per model, so the script paces itself and caps the run:

```bash
python scripts/evaluate_chatbot.py --dry-run    # retrieval only, no API calls
python scripts/evaluate_chatbot.py --budget 100 --rpm 15
```

## Rebuilding the corpus from the live site

Only needed when the site has changed. Order matters — `consolidate_chunks.py`
merges the three sources and drops passages that appear in more than one.

```bash
python scripts/crawl_fintech.py --locale en    # ~6 min, needs chromium
python scripts/ingest_api.py --prefer en
python scripts/ingest_pdfs.py                  # the two PDFs in data/
python scripts/consolidate_chunks.py           # -> data/chunks_all.jsonl
python scripts/build_index.py
```

## Retrieval, and why `k` is 20 → 7

The search is two-stage: FAISS returns **20** candidates on dense similarity,
hybrid scoring reranks them, and the top **7** reach the prompt.

### Why a wide band and not a narrow one

k=5 straight off the vector search was measured and **failed**. The three most
basic questions a visitor would ask returned no passage that answered them:

| Question | Answer in top-5? | What came back instead |
|---|---|---|
| BKFintech là gì? | No | three articles about BKFintech Hackday |
| Địa chỉ ở đâu? | No | course pages describing class format |
| Ai là Viện trưởng? | No | conference speaker biographies |

The passages existed — they ranked **#4–#9**. Fetching 20 and reranking covers
that band; taking 7 keeps the prompt small without clipping it.

### The two queries

A Vietnamese question is also translated to English and searched with *both*,
keeping the better score per chunk. Every page that answers a question about the
institute — solutions, labs, staff, academic, home — is in English, while the
questions arrive in Vietnamese. The local translator mangles domain terms often
enough (*"Ai là Viện trưởng?"* → *"Who's the Chief?"*) that replacing the query
outright would lose matches, so both are kept.

### Filters that matter more than k

Both in `app/services/retriever.py`:

- **Score floor (0.35)** on the raw cosine, applied *before* reranking. FAISS
  returns k results no matter how poor the match, so without a floor an
  off-topic question fills the prompt with confident-looking noise.
- **Max 3 chunks per URL**, applied *after* reranking. One long article
  otherwise takes most of the window and crowds out the short page that holds
  the answer.

### Reading the scores

After reranking, `score` is a **hybrid 0–1 value**, min-max normalised across
the candidate set — not a cosine. The raw values survive as `dense_score` and
`lexical_score` on each hit. Do not compare a post-rerank score against a cosine
threshold; they are different scales.

## Layout

| Path | What it does |
|---|---|
| `app/main.py` | FastAPI app: `/`, `/api/chat` (SSE), `/api/health` |
| `app/services/retriever.py` | Embed the question, search FAISS, rerank, filter |
| `app/services/translator.py` | Local vi→en translation of the query |
| `app/services/llm.py` | Build the grounded prompt, stream from Gemini |
| `app/services/chunking.py` | Chunking strategies shared by every ingester |
| `app/static/index.html` | Chat UI |
| `scripts/download_model.py` | Fetch and cache the BGE-M3 weights |
| `scripts/preview_prompt.py` | Show retrieval + prompt without calling the API |
| `scripts/evaluate_chatbot.py` | DeepEval scoring under a hard request cap |
| `testrun/` | Overlap-only baseline, kept for comparison — not dead code |

## Configuration

| Env var | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` | — | Or `GOOGLE_API_KEY` |
| `CHATBOT_MODEL` | `gemini-3.1-flash-lite` | |
| `CHATBOT_TOP_K` | `7` | Chunks reaching the prompt, after reranking 20 |
| `CHATBOT_MAX_POINTS` | `5` | Bullets the answer may use |
| `CHATBOT_THINKING` | `LOW` | Answering from supplied passages is closer to extraction than open reasoning |
| `CHATBOT_TRANSLATE` | `1` | Set `0` to search with the question as typed |
| `CHATBOT_MOCK` | — | Set `1` to print the retrieved chunks instead of calling the model |
| `CHATBOT_DENSE_WEIGHT` | `0.7` | Hybrid rerank weights; both scores are |
| `CHATBOT_SPARSE_WEIGHT` | `0.3` | min-max normalised before they are combined |
