/**
 * Session-scoped chat history, kept in MongoDB so a multi-turn question can
 * refer back to what was just asked. Direct port of chat_history.py.
 *
 * Reuses MONGODB_URI so this lands in the same database the Payload/Next.js
 * CMS side already reads, without inventing a second Mongo config that could
 * drift out of sync — same reasoning as the Python original. Messages live
 * in their own `chat_sessions` collection.
 *
 * Only the last HISTORY_MAX_MESSAGES are kept per session — see config.ts.
 */
import { MongoClient, Collection, Document, UpdateFilter } from "mongodb";
import { HISTORY_MAX_MESSAGES, MONGODB_URI, SESSION_TTL_SECONDS } from "./config";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Cached across warm invocations of the same serverless instance — re-running
// MongoClient.connect() per request would otherwise re-establish a TCP/TLS
// handshake on every call. `global` survives module reloads in Next.js dev
// mode; a plain module-level variable would get a fresh client on every hot
// reload and slowly leak connections.
declare global {
   
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClient(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

async function sessions(): Promise<Collection<Document>> {
  const client = await getClient();
  // getDefaultDatabase-equivalent: MongoClient reads the db name out of the
  // URI's path, same as pymongo's get_default_database() did in the Python
  // version, so this lands in the same DB without hardcoding "bkft".
  const db = client.db();
  const coll = db.collection("chat_sessions");
  await ensureTtlIndex(coll);
  return coll;
}

// Created once per warm instance rather than via a separate migration step —
// creating an index that already exists with the same options is a no-op, so
// this is safe to call on every cold start. If SESSION_TTL_SECONDS changed
// since the index was first created, Mongo refuses to alter it in place
// (IndexOptionsConflict) — drop and recreate rather than let that crash the
// request, same handling as the Python side's OperationFailure catch.
let ttlIndexReady: Promise<void> | null = null;
function ensureTtlIndex(coll: Collection<Document>): Promise<void> {
  if (!ttlIndexReady) {
    ttlIndexReady = coll
      .createIndex(
        { updated_at: 1 },
        { expireAfterSeconds: SESSION_TTL_SECONDS }
      )
      .then(() => undefined)
      .catch(async () => {
        await coll.dropIndex("updated_at_1").catch(() => undefined);
        await coll.createIndex(
          { updated_at: 1 },
          { expireAfterSeconds: SESSION_TTL_SECONDS }
        );
      });
  }
  return ttlIndexReady;
}

/** Push one message onto the session, trimming to the last
 * HISTORY_MAX_MESSAGES via $slice — same as chat_history.py's append_message,
 * so the document never needs a separate cleanup pass. */
export async function appendMessage(
  sessionId: string,
  role: ChatRole,
  content: string
): Promise<void> {
  const coll = await sessions();
  const now = new Date();
  await coll.updateOne(
    { _id: sessionId as unknown as Document["_id"] },
    {
      $push: {
        messages: {
          $each: [{ role, content }],
          $slice: -HISTORY_MAX_MESSAGES,
        },
      },
      $set: { updated_at: now },
      $setOnInsert: { created_at: now },
    } as unknown as UpdateFilter<Document>,
    { upsert: true }
  );
}

/**
 * Drop a session's messages the moment the conversation ends.
 *
 * The TTL index below is a backstop, not the delete path: it is the only thing
 * that ever removed a session before, so a transcript stayed readable in the
 * database for SESSION_TTL_SECONDS after the tab that produced it was gone.
 * Nothing could reach it by then either — the session id is a per-mount
 * `crypto.randomUUID()` held only in the widget's memory, never persisted to
 * the browser, so a reload starts a new session and orphans the old document.
 * It was retained storage no feature could use.
 *
 * Deleting a session that does not exist is a no-op, so this is safe to call
 * for a tab that never sent a message, and safe to call twice.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const coll = await sessions();
  await coll.deleteOne({ _id: sessionId as unknown as Document["_id"] });
}

/** Oldest-to-newest messages for this session, or [] for a new one. */
export async function getHistory(sessionId: string): Promise<ChatMessage[]> {
  const coll = await sessions();
  const doc = await coll.findOne(
    { _id: sessionId as unknown as Document["_id"] },
    { projection: { messages: 1 } }
  );
  return (doc?.messages as ChatMessage[]) || [];
}
