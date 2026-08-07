# BKFintech Chatbot — Next.js + Vercel AI SDK port

Rewrite of the Python FastAPI chatbot service (retriever + Gemini answerer) in
Next.js, using the Vercel AI SDK (`ai` + `@ai-sdk/google`) for the LLM call.
The crawler/parser pipeline that produces `data/processed/chunks.json` is
**not** part of this rewrite — that stays as-is on the Python side, per the
existing project. This project starts from `chunks.json` onward: embedding,
vector search, translation, chat history, and streaming answers.

## How each Python module maps to this project

| Python                  | JS/TS                                       | Notes |
|--------------------------|----------------------------------------------|-------|
| `retriever.py`           | `src/lib/retriever.ts`                      | Same two-stage hybrid search, same filters |
| `Data_embedding` (used by retriever.py) | `src/lib/embedding.ts`       | **See caveat below — lexical half is an approximation** |
| FAISS `VectorStore`      | `src/lib/vectorStore.ts`                    | Brute-force cosine, not FAISS — see file comment |
| `translator.py`          | `src/lib/translator.ts`                     | transformers.js instead of CTranslate2 |
| `chat_history.py`        | `src/lib/chatHistory.ts`                    | Node `mongodb` driver instead of pymongo |
| `llm.py`                 | `src/lib/llm.ts`                            | Vercel AI SDK `streamText` instead of `google-genai` directly |
| `main.py`                 | `src/app/api/chat/route.ts`, `src/app/api/health/route.ts` | Same SSE event contract (`sources`/`delta`/`done`/`error`), so the existing React widget doesn't need to change |
| (none — offline step)    | `scripts/build-index.ts`                    | New: embeds `chunks.json` into `data/faiss_index_js/store.json` |

## Setup

```bash
cp .env.example .env.local
# fill in GOOGLE_GENERATIVE_AI_API_KEY and MONGODB_URI
npm install
```

Point `CHATBOT_CHUNKS_PATH` (or the default `data/processed/chunks.json`) at
the output of the existing Python crawl/parse pipeline, then build the vector
index once, offline:

```bash
npm run build-index
```

This downloads BGE-M3 (~1.1GB) on first run via transformers.js, embeds every
chunk, and writes `data/faiss_index_js/store.json`. Expect it to take a
while and use several GB of RAM — this is meant to run on a dev machine or CI
step, not inside a request.

```bash
npm run dev
```

Visit `http://localhost:3000` for a minimal demo chat UI, or `POST
http://localhost:3000/api/chat` directly with
`{"question": "...", "session_id": "..."}` to get the SSE stream the real
widget consumes.

## Known differences from the Python version — read before treating this as a straight swap

1. **Lexical/sparse scoring is an approximation, not a port.** The Python
   side used FlagEmbedding's BGE-M3 model, which produces a *learned* sparse
   weight per token from the same forward pass as the dense embedding.
   transformers.js's generic feature-extraction pipeline doesn't expose that
   sparse head — there's no equivalent entry point. `embedding.ts` instead
   computes plain term-frequency weights over whole lowercased words. It's a
   real signal (exact term/acronym matches still get boosted) but weaker than
   the trained one. If retrieval on exact-term queries (course slugs,
   acronyms) is noticeably worse than the Python version, this is the first
   place to look, and `DENSE_WEIGHT`/`SPARSE_WEIGHT` in `config.ts` — tuned
   for the *learned* signal — are the first thing to retune.

2. **No FAISS.** `vectorStore.ts` does a brute-force cosine scan instead of
   an ANN index, specifically to avoid native-addon build/runtime
   fragility on Vercel. Fine for hundreds–thousands of chunks (a single
   institute's site); revisit if the corpus grows much larger.

3. **Translation model differs.** Python used a CTranslate2 int8 export of
   Helsinki-NLP/opus-mt-vi-en; this uses an ONNX build
   (`Xenova/opus-mt-vi-en`) via transformers.js. Expect a similar *class* of
   mistranslation on domain terms (documented in `translator.py`'s
   docstring) but not necessarily the identical failures — that's why
   `retriever.ts` still searches with both the original and translated query
   rather than trusting the translation alone.

4. **Serverless model-loading cost is real.** BGE-M3 is large (~1.1GB
   fp32). It's loaded once per warm serverless instance (module-level cache
   in `embedding.ts`/`translator.ts`), but a cold start pays the full
   load time — likely several seconds to tens of seconds, not measured
   precisely here since that depends on the deploy target. If this matters
   for the demo, consider: keeping the function warm, deploying on a
   platform with persistent processes instead of serverless, or moving
   embedding to a small always-on service and keeping only the Gemini
   call + streaming in the Next.js API route. Worth raising with your mentor
   before treating this as the production architecture.

5. **`vercel.json` sets `maxDuration: 180`** for `/api/chat` to match
   `TIMEOUT_MS` in `config.ts`. Vercel's Hobby plan caps function duration
   below that — this config assumes at least a Pro plan, or should be lowered
   together with `CHATBOT_TIMEOUT_MS` to fit whatever plan is actually used.

## Environment variables

See `.env.example` for the full list with defaults.
