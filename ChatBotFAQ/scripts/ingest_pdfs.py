"""Turn the Vietnam Digital Economy Review PDFs into chatbot-ready chunks.

These are books, not web pages, and need their own preprocessing:

  * spaces rebuilt from glyph positions. The 2024 PDF positions glyphs instead
    of emitting space characters, so plain extraction yields "tỷUSD" and
    "Bắc Mỹvà"; all three PyMuPDF text modes give the same result, because the
    space is simply not in the file. Measuring the horizontal gap between
    characters restores the word boundaries.
  * repeated running headers dropped — "VIETNAM DIGITAL ECONOMY REVIEW 2025"
    sits on 99 of 108 pages and would otherwise open nearly every chunk.
  * cover, contact and table-of-contents pages skipped.
  * chunks cut inside a section, so one chunk never spans two PHAN.

Usage:
    python scripts/ingest_pdfs.py
"""
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

import fitz

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.chunking import (
    build_context_header,
    chunk_text,
    make_chunk_id,
    pick_overlap,
    with_context,
)

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_PATH = DATA_DIR / "chunks_pdf.jsonl"

# A gap wider than this share of the font size means a missing space. Verified
# stable across 0.08-0.25 on both books, and a no-op on the 2025 PDF.
SPACE_GAP_RATIO = 0.15

# Body text is 11pt (2025) and 10pt (2024), so anything this large is a heading.
HEADING_MIN_SIZE = 16.0

# Below this length a heading-sized line is a chart label ("B", "63,3%").
MIN_HEADING_CHARS = 4

# A line repeated on more than this share of pages is a running header/footer.
RUNNING_LINE_PAGE_RATIO = 0.30

BOOKS = [
    {
        "path": DATA_DIR / "CanEbook_VIETNAM DIGITAL ECONOMY REVIEW 2025.v3.2.pdf",
        "slug": "vder2025",
        "title": "Vietnam Digital Economy Review 2025",
        "url": "https://fintech.hust.edu.vn/get-involved/vietnam-digital-economy-review/2025",
    },
    {
        "path": DATA_DIR / "Vietnam D-economy Review 2024 - Final v12.5.pdf",
        "slug": "vder2024",
        "title": "Vietnam Digital Economy Review 2024",
        "url": "https://fintech.hust.edu.vn/get-involved/vietnam-digital-economy-review/2024",
    },
]

SKIP_PAGE_MARKERS = ("MỤC LỤC", "THÔNG TIN LIÊN HỆ", "ĐƠN VỊ PHÁT HÀNH", "ĐƠN VỊ THAM GIA")
PAGE_NUMBER_RE = re.compile(r"^[\s\-–—|]*\d{1,3}[\s\-–—|]*$")


def parse_pdf_date(raw: str):
    """PDF dates look like D:20260107095015Z or D:20250114120650+07'00'."""
    if not raw:
        return None
    m = re.search(r"(\d{4})(\d{2})(\d{2})", raw)
    if not m:
        return None
    try:
        return datetime(*(int(g) for g in m.groups())).strftime("%Y-%m-%d")
    except ValueError:
        return None


def read_lines(page):
    """Return [(text, font_size)] for a page, inserting the spaces the PDF omits."""
    lines = []
    for block in page.get_text("rawdict")["blocks"]:
        if block.get("type") != 0:   # skip images
            continue
        for line in block["lines"]:
            buf, prev_x1, max_size = "", None, 0.0
            for span in line["spans"]:
                size = span.get("size", 10.0)
                max_size = max(max_size, size)
                for ch in span["chars"]:
                    x0, _, x1, _ = ch["bbox"]
                    if prev_x1 is not None and ch["c"] != " " and x0 - prev_x1 > SPACE_GAP_RATIO * size:
                        buf += " "
                    buf += ch["c"]
                    prev_x1 = x1
            text = re.sub(r"\s+", " ", buf).strip()
            if text:
                lines.append((text, round(max_size, 1)))
    return lines


def find_running_lines(pages_lines) -> set:
    """Lines that top or tail most pages are running headers, not content."""
    counter = Counter()
    for lines in pages_lines:
        for text in set(t for t, _ in lines[:2] + lines[-2:]):
            counter[text] += 1
    threshold = max(3, int(len(pages_lines) * RUNNING_LINE_PAGE_RATIO))
    return {text for text, count in counter.items() if count >= threshold}


def is_front_matter(lines) -> bool:
    joined = " ".join(t for t, _ in lines[:6]).upper()
    return any(marker in joined for marker in SKIP_PAGE_MARKERS)


def join_heading(parts: list[str]) -> str:
    """Join wrapped heading lines, dropping ones already covered.

    A part-divider page repeats its title on the following page, so the raw run
    reads "PHẦN I: TỔNG QUAN VỀ CHUYỂN ĐỔI SỐ / PHẦN I / TỔNG QUAN VỀ ...".
    """
    kept = []
    for part in parts:
        lowered = part.lower()
        if any(lowered in k.lower() for k in kept):
            continue
        kept = [k for k in kept if k.lower() not in lowered]
        kept.append(part)
    return " ".join(kept)


def build_sections(book):
    """Split a book into {section, text}, following the headings in reading order."""
    doc = fitz.open(book["path"])
    published_at = parse_pdf_date(doc.metadata.get("creationDate"))
    pages_lines = [read_lines(page) for page in doc]
    doc.close()

    running = find_running_lines(pages_lines)
    sections, current_title, current_parts, pending_heading = [], None, [], []

    def flush():
        if current_parts:
            sections.append({
                "section": current_title,
                "text": re.sub(r"\s+", " ", " ".join(current_parts)).strip(),
            })

    for lines in pages_lines:
        if is_front_matter(lines):
            continue
        for text, size in lines:
            if text in running or PAGE_NUMBER_RE.match(text):
                continue
            if size >= HEADING_MIN_SIZE:
                # Titles wrap over several lines, so collect runs of heading
                # lines and join them once body text resumes.
                if len(text) >= MIN_HEADING_CHARS:
                    if not pending_heading:
                        flush()
                        current_parts = []
                    pending_heading.append(text)
                continue
            if pending_heading:
                current_title = join_heading(pending_heading)
                pending_heading = []
            current_parts.append(text)
    flush()

    return [s for s in sections if s["text"]], published_at


def main(max_words: int = 250, overlap: int = None):
    overlap = pick_overlap(max_words, overlap)
    all_chunks = []

    for book in BOOKS:
        if not book["path"].exists():
            print(f"[skip] missing {book['path'].name}")
            continue

        sections, published_at = build_sections(book)
        print(f"{book['title']}: {len(sections)} sections | published_at={published_at}")

        for section_no, section in enumerate(sections, start=1):
            pieces = chunk_text(section["text"], max_words=max_words, overlap=overlap)
            if not pieces:
                continue
            title = book["title"]
            if section["section"]:
                title = f"{title} — {section['section']}"
            # Same breadcrumb the web and API chunks carry: a passage lifted from
            # the middle of a 108-page report says nothing about which report or
            # which PHAN it came from unless the header says so.
            header = build_context_header(book["title"], section["section"])
            for i, content in enumerate(pieces, start=1):
                all_chunks.append({
                    "chunk_id": make_chunk_id(
                        book["slug"], section["section"] or f"s{section_no:02d}", index=i),
                    "content": with_context(header, content),
                    "raw": content,
                    "title": title,
                    "url": book["url"],
                    "collection": "report",
                    "page_type": "report",
                    "published_at": published_at,
                    "lang": "vi",
                    "section": section["section"],
                })

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
    print(f"\nWrote {len(all_chunks)} chunks to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
