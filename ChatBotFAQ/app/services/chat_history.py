"""Session-scoped chat history, kept in MongoDB so a multi-turn question can
refer back to what was just asked.

Reuses `DATABASE_URI` — the same connection string the Payload/Next.js side of
this repo already reads for MongoDB — instead of inventing a second Mongo
config that could drift out of sync with it. Chat messages live in their own
`chat_sessions` collection so they never mix with anything else in that
database.

Only the last 3 Q&A pairs are kept per session: enough for the model to follow
a pronoun back to what it refers to, not so much that an old, unrelated
question keeps steering answers to new ones.
"""
import os
from datetime import datetime, timezone

from pymongo import MongoClient
from pymongo.errors import OperationFailure

DATABASE_URI = os.environ.get("DATABASE_URI", "mongodb://localhost:27017/bkft")

# 6 messages = 3 Q&A pairs. Kept small on purpose — see module docstring.
HISTORY_MAX_MESSAGES = 6

# How long a session survives without a new message before Mongo's TTL monitor
# reaps it. Defaults to 7 days so an abandoned tab doesn't linger forever.
SESSION_TTL_SECONDS = int(os.environ.get("SESSION_TTL_SECONDS", "604800"))

_client = MongoClient(DATABASE_URI)
# get_default_database() reads the db name out of DATABASE_URI's path, so this
# lands in the same database as the crawl/chunks side without hardcoding "bkft".
_sessions = _client.get_default_database()["chat_sessions"]

# Created at import time rather than via a separate migration step: creating an
# index that already exists with the same options is a no-op, so this is safe
# to run on every process start. If SESSION_TTL_SECONDS was changed since the
# index was first created, Mongo refuses to alter it in place and raises
# IndexOptionsConflict — drop and recreate rather than let that crash startup.
try:
    _sessions.create_index("updated_at", expireAfterSeconds=SESSION_TTL_SECONDS)
except OperationFailure:
    _sessions.drop_index("updated_at_1")
    _sessions.create_index("updated_at", expireAfterSeconds=SESSION_TTL_SECONDS)


def append_message(session_id: str, role: str, content: str) -> None:
    """Push one message onto the session, trimming to the last 6.

    `$slice: -6` keeps the newest messages and drops the oldest as soon as the
    cap is exceeded, so the document never needs a separate cleanup pass.
    """
    now = datetime.now(timezone.utc)
    _sessions.update_one(
        {"_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [{"role": role, "content": content}],
                    "$slice": -HISTORY_MAX_MESSAGES,
                }
            },
            "$set": {"updated_at": now},
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )


def get_history(session_id: str) -> list[dict]:
    """Oldest-to-newest messages for this session, or [] for a new one."""
    doc = _sessions.find_one({"_id": session_id}, {"messages": 1})
    return doc["messages"] if doc else []
