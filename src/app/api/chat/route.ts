import { NextRequest, NextResponse } from 'next/server'

// ChatBotFAQ is a separate FastAPI service (retrieval + Gemini), not part of
// this Next.js app. Proxying keeps it off the public internet and lets the
// widget stay a same-origin, non-streaming JSON caller.
const CHATBOT_FAQ_URL = process.env.CHATBOT_FAQ_URL || 'http://localhost:8000'
const REQUEST_TIMEOUT_MS = 30_000

type SseEvent = { event: string; data: string }

function parseSseFrames(buffer: string): { events: SseEvent[]; rest: string } {
  const frames = buffer.split('\n\n')
  const rest = frames.pop() ?? ''
  const events: SseEvent[] = []
  for (const frame of frames) {
    const eventMatch = /^event: (.+)$/m.exec(frame)
    const dataMatch = /^data: (.+)$/m.exec(frame)
    if (eventMatch && dataMatch) {
      events.push({ event: eventMatch[1], data: dataMatch[1] })
    }
  }
  return { events, rest }
}

export async function POST(req: NextRequest) {
  let message: unknown
  try {
    ;({ message } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }
  const question = message.trim().slice(0, 2000)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let upstream: Response
  try {
    upstream = await fetch(`${CHATBOT_FAQ_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
  } catch {
    return NextResponse.json(
      { error: 'Chatbot service is unreachable' },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `Chatbot service error ${upstream.status}` },
      { status: 502 },
    )
  }

  // The backend streams SSE (sources / delta / error / done); the widget
  // wants one JSON reply, so the deltas are collected server-side here.
  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''
  let sources: unknown[] = []
  let errorMessage: string | null = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const { events, rest } = parseSseFrames(buffer)
    buffer = rest

    for (const { event, data } of events) {
      const payload = JSON.parse(data)
      if (event === 'sources') sources = payload.sources ?? []
      else if (event === 'delta') reply += payload.text ?? ''
      else if (event === 'error') errorMessage = payload.message ?? 'Unknown error'
    }
  }

  if (errorMessage) {
    return NextResponse.json({ error: errorMessage, sources }, { status: 502 })
  }

  return NextResponse.json({ reply, sources })
}
