/**
 * Warm the local ONNX model (BGE-M3 embeddings) once, at server start, instead
 * of on whichever request happens to arrive first. Chỉ còn một model kể từ khi
 * bước dịch vi->en bằng Marian được thay bằng một lần gọi LLM (queryRewriter.ts)
 * — không còn gì để nạp sẵn cho nhánh đó.
 *
 * Why here and not lazily: this deploys as a long-lived process on the
 * school's own server (compose.yaml -> `node server.js` from Next's
 * standalone output), not on serverless, so the process outlives every
 * request and the model cache directory survives restarts. Under the lazy
 * loading in embedding.ts the *first* visitor after each deploy paid the whole
 * model load — hundreds of MB of ONNX session init — inside their own request.
 * Loading at boot moves that cost to a moment when nobody is waiting.
 *
 * Next.js runs `register()` once per server process, before it starts
 * serving. `NEXT_RUNTIME` is checked because instrumentation also runs on the
 * edge runtime, where the model cannot load at all; the actual work sits in
 * instrumentation-node.ts so that its Node APIs never reach the edge bundle.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { registerNode } = await import("./instrumentation-node");
  await registerNode();
}
