import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/chatbot/chatHistory'

// Ends a chat session and removes its transcript from MongoDB. The widget
// calls this when the tab goes away, so a conversation is not left sitting in
// the database waiting for the TTL index to expire it.
export const runtime = 'nodejs'

/**
 * POST rather than DELETE, and this is the whole reason the route exists
 * separately from /api/chat: the call has to survive the page unloading, which
 * means `navigator.sendBeacon`, and sendBeacon can only issue POST. A regular
 * `fetch(..., { method: 'DELETE' })` fired from a `pagehide` handler is
 * cancelled when the document goes away, which is precisely the moment this
 * needs to work. DELETE is exported too for anything calling it normally.
 */
async function endSession(req: NextRequest) {
  let session_id: unknown
  try {
    ;({ session_id } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (typeof session_id !== 'string' || !session_id.trim()) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  try {
    await deleteSession(session_id.trim())
  } catch (err) {
    // The tab is already gone, so nobody is waiting on this response — but a
    // database that is refusing deletes is exactly the failure that would
    // silently retain transcripts, so it must be visible server-side.
    console.error('    !! không xoá được phiên chat:', err)
    return NextResponse.json({ error: 'Không xoá được phiên chat.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export const POST = endSession
export const DELETE = endSession
