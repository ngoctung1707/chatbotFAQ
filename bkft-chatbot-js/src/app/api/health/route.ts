import { NextResponse } from "next/server";
import { CHAT_MODEL, DEFAULT_TOP_K, MOCK, TRANSLATE_ENABLED } from "@/lib/config";
import { VectorStore } from "@/lib/vectorStore";

export const runtime = "nodejs";

export async function GET() {
  let chunksIndexed = 0;
  let indexError: string | null = null;
  try {
    const store = await VectorStore.load();
    chunksIndexed = store.size;
  } catch (err) {
    indexError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    status: indexError ? "index_missing" : "ok",
    model: MOCK ? "mock (không gọi API)" : CHAT_MODEL,
    chunks_indexed: chunksIndexed,
    default_top_k: DEFAULT_TOP_K,
    mock: MOCK,
    translate_query: TRANSLATE_ENABLED,
    ...(indexError ? { index_error: indexError } : {}),
  });
}
