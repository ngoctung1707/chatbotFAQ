"""Pull news and solutions from the site's Payload CMS API.

Scraping the rendered article pages means fighting boilerplate: the navigation
is rendered twice per page, plus header, breadcrumb and footer, so most of a
page's text is chrome shared with every other page. Chunks built from that read
almost alike and cosine similarity loses its ability to separate them.

The CMS exposes the same content as JSON with the useful fields already split
out (lang, publishedAt, tag, headings). Anything the API will not serve
(courses detail, publications, staff) still comes from the crawler.

Endpoints, as probed against production:
    /api/news          200, 113 docs
    /api/solutions     200, 8 docs
    /api/courses       200, slug+title only — no detail route
    /api/publications  403      /api/members 403      others 404

Usage:
    python scripts/ingest_api.py
    python scripts/ingest_api.py --prefer vi
"""
import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.chunking import (
    build_context_header,
    chunk_prose,
    chunk_sections,
    make_chunk_id,
    with_context,
)

API_BASE = "https://fintech.hust.edu.vn/api"
SITE_BASE = "https://fintech.hust.edu.vn"
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_PATH = DATA_DIR / "chunks_api.jsonl"

MAX_WORDS = 250
SECTION_HEADING_TAGS = {"h1", "h2", "h3"}   # h4+ reads as inline emphasis


def fetch(path: str) -> dict:
    with urllib.request.urlopen(f"{API_BASE}/{path}", timeout=40) as resp:
        return json.loads(resp.read().decode("utf-8"))


def node_text(node: dict) -> str:
    """Flatten a Lexical rich-text node subtree into plain text."""
    if node.get("type") == "text":
        return node.get("text", "")
    if node.get("type") == "linebreak":
        return " "
    return "".join(node_text(child) for child in node.get("children") or [])


def lexical_to_sections(content) -> list[dict]:
    """Split Payload rich text into [{heading, text}] following its headings."""
    if not isinstance(content, dict) or "root" not in content:
        return []

    sections: list[dict] = []
    heading = None
    buffer: list[str] = []

    def flush():
        text = re.sub(r"\s+", " ", " ".join(buffer)).strip()
        if text:
            sections.append({"heading": heading, "text": text})

    for node in content["root"].get("children") or []:
        node_type = node.get("type")
        if node_type == "heading" and node.get("tag") in SECTION_HEADING_TAGS:
            flush()
            buffer = []
            heading = re.sub(r"\s+", " ", node_text(node)).strip() or None
            continue
        if node_type in ("upload", "horizontalrule"):   # images and rules carry no text
            continue
        text = node_text(node).strip()
        if text:
            buffer.append(text)
    flush()
    return sections


def iso_date(value):
    return value[:10] if isinstance(value, str) and len(value) >= 10 else None


def _relation_id(value):
    return value.get("id") if isinstance(value, dict) else value


def dedupe_by_language(docs, prefer, image_field="heroImage"):
    """Keep one language per article.

    Most articles are published twice — once per language — and indexing both
    fills the top-k with two copies of one answer. The versions carry different
    slugs and titles, so they only line up through what the editor did not
    retype: the same uploaded hero image (falling back to the publish timestamp
    for an article without one).

    An article that exists in only one language is kept whatever that language
    is, so nothing is lost by preferring the other.
    """
    groups: dict = {}
    for doc in docs:
        key = _relation_id(doc.get(image_field)) or doc.get("publishedAt") or doc.get("slug")
        groups.setdefault(key, []).append(doc)

    kept, dropped = [], 0
    for group in groups.values():
        preferred = [d for d in group if d.get("lang") == prefer]
        if preferred:
            dropped += len(group) - len(preferred)
            kept.extend(preferred)
        else:
            kept.extend(group)
    return kept, dropped


def emit(chunks, source, stem, base_meta, sections, strategy):
    index = 0
    for section in sections:
        heading = section.get("heading")
        pieces = (
            chunk_prose(section["text"], max_words=MAX_WORDS, overlap_sentences=1)
            if strategy == "prose" else [section["text"]]
        )
        for piece in pieces:
            index += 1
            chunks.append({
                "chunk_id": make_chunk_id(source, stem, index=index),
                "content": with_context(
                    build_context_header(base_meta["title"], heading), piece),
                "raw": piece,
                "title": base_meta["title"],
                "url": base_meta["url"],
                "collection": base_meta["collection"],
                "page_type": base_meta["page_type"],
                "published_at": base_meta["published_at"],
                "lang": base_meta["lang"],
                "section": heading,
            })


def ingest_news(chunks, prefer):
    data = fetch("news?limit=500")
    docs = [d for d in data.get("docs", []) if d.get("_status") == "published"]
    docs, dropped = dedupe_by_language(docs, prefer)
    print(f"news      : {len(docs)} kept ({dropped} translations dropped, "
          f"{data.get('totalDocs')} total)")
    for doc in docs:
        sections = lexical_to_sections(doc.get("content"))
        if not sections:
            continue
        slug = doc.get("slug") or "untitled"
        emit(chunks, "news", slug, {
            "title": (doc.get("title") or "").strip(),
            "url": f"{SITE_BASE}/news/{slug}",
            "collection": "news",
            "page_type": "news",
            "published_at": iso_date(doc.get("publishedAt")),
            "lang": doc.get("lang"),
        }, sections, strategy="prose")


def ingest_solutions(chunks, prefer):
    data = fetch("solutions?limit=200")
    docs = [d for d in data.get("docs", []) if d.get("_status") == "published"]
    docs, dropped = dedupe_by_language(docs, prefer, image_field="backgroundImage")
    print(f"solutions : {len(docs)} kept ({dropped} translations dropped)")
    for doc in docs:
        title = (doc.get("title") or "").strip()
        sections = lexical_to_sections(doc.get("content"))
        summary = (doc.get("shortDescription") or "").strip()
        if summary:
            sections = [{"heading": None, "text": summary}] + sections
        sections = chunk_sections(sections, max_words=MAX_WORDS)
        if not sections:
            continue
        emit(chunks, "solution", title, {
            "title": title,
            "url": f"{SITE_BASE}/solutions/{title}",
            "collection": "solutions",
            "page_type": "solution",
            "published_at": iso_date(doc.get("publishedAt") or doc.get("createdAt")),
            "lang": doc.get("lang"),
        }, sections, strategy="sections")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--prefer", default="en", choices=["en", "vi"],
                        help="Language to keep when an article exists in both")
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    args = parser.parse_args()

    chunks: list[dict] = []
    ingest_news(chunks, args.prefer)
    ingest_solutions(chunks, args.prefer)
    # /api/courses and /api/research-labs return slug+title only, with no detail
    # route, so their bodies come from the crawler instead.

    with open(args.output, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
    print(f"\nWrote {len(chunks)} chunks to {args.output}")


if __name__ == "__main__":
    main()
