"""Merge every ingester's output into one reviewable corpus file.

Three ingesters write into data/, each covering a different source:

    chunks_api.jsonl   news + solutions, straight from the Payload CMS
    chunks_web.jsonl   pages the API does not expose, plus the ECOTECH sites
    chunks_pdf.jsonl   the two Vietnam Digital Economy Review books

They can overlap — an article reachable at /news/<slug> is also in the CMS
export — so this pass keeps one copy of each passage, preferring the cleaner
source, and writes a single chunks_all.jsonl.

Two different things are deduplicated, and the distinction matters:

  * identical passages, matched on their wording. Safe to collapse.
  * whole pages whose content is a near-copy of another page. Reported, and
    only dropped when one page adds nothing the other lacks. A short focused
    page (/about/board-of-deans) is *kept* even when a longer page repeats its
    content, because that focus is what makes it retrievable for a narrow
    question — dropping it would leave only a diluted copy.

Usage:
    python scripts/consolidate_chunks.py
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_PATH = DATA_DIR / "chunks_all.jsonl"

# Earlier entries win a tie: the CMS export carries no page chrome at all.
# chunks_extra.jsonl is hand-written and goes first — it states facts that exist
# in no single page ("BKFintech has 4 applications"), which is what questions
# that count or enumerate need and what crawling can never produce.
SOURCE_PRIORITY = [
    "chunks_extra.jsonl",
    "chunks_api.jsonl",
    "chunks_web.jsonl",
    "chunks_pdf.jsonl",
]

# The hand-written file fills in `content` and leaves `raw` either empty or
# holding whatever page text it was copied from. `content` is the authored fact
# in that file, so it is used for both — otherwise the LLM is handed an empty
# passage, or the wrong one, for exactly the questions these chunks exist to
# answer.
HANDWRITTEN_SOURCE = "extra"

# Two pages sharing this much of their combined wording are the same page twice.
NEAR_DUPLICATE_RATIO = 0.90

# Below this, a page is too short for a word-overlap ratio to mean anything.
MIN_PAGE_WORDS = 40


def load(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def normalise_text(text: str) -> str:
    text = re.sub(r"^\[[^\]]*\]\s*", "", text)      # drop the context header
    text = re.sub(r"[^\w\s]", " ", text.lower())    # punctuation varies
    return re.sub(r"\s+", " ", text).strip()


def fingerprint(chunk: dict) -> str:
    """Identify a passage by its wording, ignoring case, spacing and header."""
    return normalise_text(chunk.get("raw") or chunk.get("content") or "")[:400]


def report_near_duplicate_pages(chunks: list[dict]):
    """Look for pages that are near-copies of one another, and say what was found.

    Reported rather than removed by default: on this site the overlaps come
    from a broad page restating a focused one, and the focused page is the more
    useful chunk to retrieve.
    """
    by_url = defaultdict(list)
    for chunk in chunks:
        by_url[chunk["url"]].append(chunk)

    pages = {url: set(normalise_text(" ".join(c["raw"] for c in group)).split())
             for url, group in by_url.items()}

    findings = []
    urls = list(pages)
    for i, a in enumerate(urls):
        for b in urls[i + 1:]:
            wa, wb = pages[a], pages[b]
            # Short pages are skipped: a page of a dozen words is almost fully
            # contained in any longer one, which is why a containment ratio
            # reports the staff list and the council list as identical when
            # they are simply two views of the same names.
            if len(wa) < MIN_PAGE_WORDS or len(wb) < MIN_PAGE_WORDS:
                continue
            # Jaccard, not containment: a page that merely *includes* another's
            # wording is a superset, not a duplicate, and the shorter, more
            # focused page is the one worth retrieving.
            similarity = len(wa & wb) / len(wa | wb)
            if similarity >= NEAR_DUPLICATE_RATIO:
                smaller, larger = (a, b) if len(wa) <= len(wb) else (b, a)
                findings.append((similarity, smaller, larger))
    return sorted(findings, reverse=True)


def normalise(chunk: dict, source: str) -> dict:
    if source == HANDWRITTEN_SOURCE:
        raw = chunk.get("content") or chunk.get("raw") or ""
    else:
        raw = chunk.get("raw") or chunk.get("content") or ""
    return {
        "chunk_id": chunk.get("chunk_id"),
        "content": chunk.get("content") or raw,   # embedded (with breadcrumb)
        "raw": raw,                               # clean text for the LLM prompt
        "title": chunk.get("title"),
        "url": chunk.get("url"),
        "collection": chunk.get("collection"),
        "page_type": chunk.get("page_type"),
        "published_at": chunk.get("published_at"),
        "lang": chunk.get("lang") or "vi",
        "section": chunk.get("section"),
        "source": source,
        "domain": urlparse(chunk.get("url") or "").netloc,
    }


def main():
    seen: set[str] = set()
    kept: list[dict] = []

    for name in SOURCE_PRIORITY:
        path = DATA_DIR / name
        if not path.exists():
            print(f"  [miss] {name} (not generated)")
            continue
        chunks = load(path)
        source = name.replace("chunks_", "").replace(".jsonl", "")
        added = dropped = 0
        for chunk in chunks:
            # Normalise before fingerprinting, not after: the hand-written file
            # repeats the same stale `raw` across several entries whose authored
            # `content` differs, so fingerprinting the input would collapse them
            # into one and throw the catalogue away.
            record = normalise(chunk, source)
            key = fingerprint(record)
            if len(key) < 25:   # too short to fingerprint reliably
                key = f"{record['url']}#{record['chunk_id']}"
            if key in seen:
                dropped += 1
                continue
            seen.add(key)
            kept.append(record)
            added += 1
        print(f"  [ok]   {name:20s} {len(chunks):4d} read -> {added:4d} kept, "
              f"{dropped:3d} duplicate passage")

    findings = report_near_duplicate_pages(kept)
    print(f"\nnear-duplicate pages (>={int(NEAR_DUPLICATE_RATIO * 100)}% shared wording): "
          f"{len(findings)}")
    for overlap, smaller, larger in findings[:10]:
        print(f"  {overlap:.0%}  {smaller}\n        vs {larger}")
    if not findings:
        print("  none — no page is a near-copy of another, so nothing to drop")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for record in kept:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nWrote {len(kept)} chunks to {OUTPUT_PATH}")
    print("by domain     :", dict(Counter(r["domain"] for r in kept)))
    print("by source     :", dict(Counter(r["source"] for r in kept)))
    print("by language   :", dict(Counter(r["lang"] for r in kept)))
    print("by collection :", dict(Counter(r["collection"] for r in kept)))


if __name__ == "__main__":
    main()
