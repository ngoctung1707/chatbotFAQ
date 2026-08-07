"use client";

/**
 * Minimal demo chat UI — the JS equivalent of the Python side's
 * static/index.html, for exercising /api/chat end to end. The real
 * embeddable widget is the separate React component mentioned in the
 * project; this page is just enough to prove the SSE contract works.
 *
 * Uses fetch + a manual ReadableStream reader instead of EventSource:
 * EventSource can only send GET requests, and /api/chat needs a JSON body
 * (question, top_k, session_id).
 */
import { useRef, useState } from "react";

interface Source {
  n: number;
  title: string | null;
  url: string;
  score: number;
  collection: string | null;
}
interface Turn {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  error?: string;
}

function parseSseBlock(block: string): { event: string; data: unknown } | null {
  const eventLine = block.split("\n").find((l) => l.startsWith("event: "));
  const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
  if (!eventLine || !dataLine) return null;
  return {
    event: eventLine.slice("event: ".length),
    data: JSON.parse(dataLine.slice("data: ".length)),
  };
}

export default function Home() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  async function ask() {
    const q = question.trim();
    if (!q || busy) return;
    setQuestion("");
    setBusy(true);
    setTurns((t) => [...t, { role: "user", text: q }, { role: "assistant", text: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, session_id: sessionId.current }),
    });
    if (!res.body) {
      setBusy(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";
      for (const block of blocks) {
        const parsed = parseSseBlock(block);
        if (!parsed) continue;
        if (parsed.event === "sources") {
          const { sources } = parsed.data as { sources: Source[] };
          setTurns((t) => {
            const copy = [...t];
            copy[copy.length - 1] = { ...copy[copy.length - 1], sources };
            return copy;
          });
        } else if (parsed.event === "delta") {
          const { text } = parsed.data as { text: string };
          setTurns((t) => {
            const copy = [...t];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, text: last.text + text };
            return copy;
          });
        } else if (parsed.event === "error") {
          const { message } = parsed.data as { message: string };
          setTurns((t) => {
            const copy = [...t];
            copy[copy.length - 1] = { ...copy[copy.length - 1], error: message };
            return copy;
          });
        }
      }
    }
    setBusy(false);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20 }}>BKFintech Chatbot — demo</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "24px 0" }}>
        {turns.map((t, i) => (
          <div key={i}>
            <div style={{ fontWeight: 600, fontSize: 13, opacity: 0.6 }}>
              {t.role === "user" ? "Bạn" : "Trợ lý"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{t.text}</div>
            {t.error && <div style={{ color: "crimson" }}>{t.error}</div>}
            {t.sources && t.sources.length > 0 && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                {t.sources.map((s) => (
                  <div key={s.n}>
                    [{s.n}] {s.title || s.url} — {s.score.toFixed(3)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Đặt câu hỏi..."
          style={{ flex: 1, padding: 8 }}
          disabled={busy}
        />
        <button onClick={ask} disabled={busy}>
          Gửi
        </button>
      </div>
    </main>
  );
}
