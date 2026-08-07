/**
 * POST /api/chat — SSE stream of the answer. Port of main.py's /api/chat.
 *
 * Deliberately reproduces the exact same event protocol the Python version
 * sent ("sources" -> "delta"* -> "done" | "error") so the existing React
 * widget frontend — built against that contract — does not need to change to
 * point at this endpoint instead of FastAPI's.
 *
 * Runs on the Node.js runtime, not Edge: transformers.js needs Node APIs
 * (fs, for model/tokenizer files) that the Edge runtime doesn't provide.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { appendMessage, getHistory } from "@/lib/chatHistory";
import { answerStream, friendlyError } from "@/lib/llm";
import { Retriever, type RetrievalChunk } from "@/lib/retriever";
import { DEFAULT_TOP_K, MOCK } from "@/lib/config";

export const runtime = "nodejs";
// Free-tier Gemini answers were measured taking up to ~150s; default Vercel
// function timeouts (10s Hobby, 60s Pro unless configured) will cut this
// short. Set manually here as a ceiling and raise your plan's function
// timeout / vercel.json maxDuration to match TIMEOUT_MS in config.ts.
export const maxDuration = 180;

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  top_k: z.number().int().min(1).max(20).default(DEFAULT_TOP_K),
  session_id: z.string().min(1).max(200),
});

// Built once and reused across requests within a warm instance — loading the
// embedding model costs real time, same reasoning as main.py building
// `retriever`/`answerer` once at import instead of per-request.
let retrieverPromise: Promise<Retriever> | null = null;
function getRetriever(): Promise<Retriever> {
  if (!retrieverPromise) retrieverPromise = Promise.resolve(new Retriever());
  return retrieverPromise;
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function logRetrieval(
  question: string,
  queryUsed: string,
  chunks: RetrievalChunk[]
) {
  if (process.env.CHATBOT_LOG_CHUNKS === "0") return;
  console.log("\n" + "=".repeat(96));
  console.log(`HỎI: ${question}`);
  if (queryUsed && queryUsed !== question) console.log(`     tìm bằng: ${queryUsed}`);
  if (chunks.length === 0) {
    console.log("     (không đoạn nào vượt ngưỡng điểm)");
    console.log("=".repeat(96));
    return;
  }
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const dense = c.dense_score ?? c.score;
    const lexical = c.lexical_score ?? 0;
    console.log(
      `${i + 1}  score=${c.score.toFixed(4)} dense=${dense.toFixed(4)} lex=${lexical.toFixed(4)}  ${c.collection}  ${c.chunk_id}`
    );
    console.log(`    ${c.url}`);
  }
  console.log("=".repeat(96));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { question, top_k, session_id } = parsed.data;

  const retriever = await getRetriever();
  // Asked before search so it can be reported to the client; toEnglish()
  // caches, so this doesn't cost a second translation pass.
  const queryUsed = await retriever.queryFor(question);
  const chunks = await retriever.search(question, { topK: top_k });
  logRetrieval(question, queryUsed, chunks);

  // Fetched once up front, alongside retrieval — the answerer needs it
  // before the first token, same as main.py.
  const history = MOCK ? [] : await getHistory(session_id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(sse(event, data)));

      push("sources", {
        query_used: queryUsed !== question ? queryUsed : null,
        sources: chunks.map((c, i) => ({
          n: i + 1,
          title: c.title ?? null,
          url: c.url,
          score: Math.round(c.score * 10000) / 10000,
          collection: c.collection ?? null,
        })),
      });

      if (chunks.length === 0) {
        // Not saved to history — same reasoning as main.py: this reply
        // carries no knowledge-base information, so remembering it would
        // spend one of the limited history slots on a turn later questions
        // can't meaningfully refer back to.
        push("delta", {
          text:
            "Tôi không tìm thấy thông tin nào liên quan đến câu hỏi này " +
            "trong dữ liệu của BKFintech.",
        });
        push("done", {});
        controller.close();
        return;
      }

      const started = Date.now();
      const parts: string[] = [];
      try {
        for await (const text of answerStream(question, chunks, history)) {
          parts.push(text);
          push("delta", { text });
        }
      } catch (err) {
        const elapsed = ((Date.now() - started) / 1000).toFixed(1);
        console.error(`    !! lỗi sau ${elapsed}s:`, err);
        push("error", { message: friendlyError(err) });
        // Not saved — a half-formed/failed answer would poison the context
        // for every later question in this session, same as main.py.
        controller.close();
        return;
      }

      console.log(`    trả lời xong sau ${((Date.now() - started) / 1000).toFixed(1)}s`);
      if (!MOCK) {
        await appendMessage(session_id, "user", question);
        await appendMessage(session_id, "assistant", parts.join(""));
      }
      push("done", {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
