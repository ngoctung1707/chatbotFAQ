"""Baseline crawler: one fixed-size sliding window with overlap, no page routing.

This is the control for comparing chunking strategies. The production pipeline
(../scripts/crawl_fintech.py) routes each page to a splitter chosen for its
shape — records for staff lists, headings for course pages, sentences for
articles — and prefixes a breadcrumb to the embedded text. This file does none
of that. It takes whatever text a page renders, concatenates it, and cuts it
into 250-word windows with a fixed overlap, which is the conventional default.

Everything else is held equal so the comparison isolates the chunking:

  * same source (fintech.hust.edu.vn, English via the NEXT_LOCALE cookie, with
    Vietnamese-only pages kept as they are),
  * same window size and overlap band,
  * same output schema.

Deliberate differences, which are the point of the experiment:

  * no page-type routing — every page gets the same splitter,
  * overlap everywhere, including staff and publication lists,
  * no breadcrumb prefixed to the embedded text,
  * no separation of nav/footer chrome beyond reading <main>,
  * news and solutions are crawled from HTML here, not from the clean CMS API.

Scope is wider than the production crawl: every subdomain the site links to,
not just the ECOTECH conference.

Usage:
    python testrun/crawl_baseline.py
    python testrun/crawl_baseline.py --max-pages 100 --locale vi
"""
import argparse
import json
import re
import sys
import time
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.chunking import chunk_text, pick_overlap

BASE = "https://fintech.hust.edu.vn"
MAIN_HOST = urlparse(BASE).netloc
OUTPUT_PATH = Path(__file__).resolve().parent / "chunks_baseline.jsonl"

MAX_WORDS = 250

SKIP_EXTENSIONS = (
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp", ".css", ".js",
    ".json", ".xml", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".zip", ".rar", ".mp4", ".mp3", ".avi", ".mov", ".woff", ".woff2", ".ttf", ".eot",
)

TRACKING_PARAMS = re.compile(r"^(fbclid|gclid|msclkid|ref|utm_[a-z_]+)$", re.I)
LANG_SUFFIX = re.compile(r"[-_](en|eng|english|vi|vie|vn)$", re.I)
VN_DIACRITICS = re.compile(r"[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]")

# Plain text of the page, exactly as a naive extractor would take it: whatever
# <main> renders, with no attempt to tell content from chrome.
EXTRACT_JS = r"""
() => {
  const root = document.querySelector('main') || document.body;
  return {
    title: (document.title || '').trim(),
    text: root ? root.innerText : '',
  };
}
"""


def clean_query(query: str) -> str:
    kept = [p for p in query.split("&")
            if p and not TRACKING_PARAMS.match(p.split("=", 1)[0])]
    return "&".join(kept)


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path or "/"
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    return urlunparse((parsed.scheme, parsed.netloc, path, "", clean_query(parsed.query), ""))


def in_scope(netloc: str) -> bool:
    """The main site plus the ECOTECH conference, and nothing else.

    Other hosts the site links to are separate products or partners — BKSign
    and BKOffice are login screens, MB Bank and AIPad are other companies'
    marketing sites, Springer is a paper. None of them is BKFintech content,
    and following their links turns the crawl into a walk of the open internet:
    an early run reached mbbank.com.vn and six levels of aipad.vn.

    Matching production scope also keeps this baseline a fair comparison: the
    only thing that differs between the two runs should be the chunking.
    """
    netloc = netloc.lower()
    return netloc == MAIN_HOST or "ecotech" in netloc


def collection_of(url: str) -> str:
    if urlparse(url).netloc != MAIN_HOST:
        return urlparse(url).netloc.split(".")[0]
    parts = [p for p in urlparse(url).path.split("/") if p]
    return parts[0].lower() if parts else "home"


def guess_lang(text: str) -> str:
    return "vi" if VN_DIACRITICS.search(text.lower()) else "en"


def id_stem(url: str) -> str:
    parsed = urlparse(url)
    stem = parsed.path.strip("/") or "home"
    if parsed.netloc != MAIN_HOST:
        stem = f"{parsed.netloc.split('.')[0]}-{Path(parsed.path).stem or 'home'}"
    if parsed.query:
        stem = f"{stem}-{parsed.query}"
    return re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-")[:60] or "page"


def dedupe_by_language(chunks, prefer):
    """Same rule as production: collapse …-en / …-vie twins to the preferred
    language, and keep a page that exists in only one language."""
    groups: dict = {}
    for chunk in chunks:
        parsed = urlparse(chunk["url"])
        key = (parsed.netloc, LANG_SUFFIX.sub("", parsed.path.rstrip("/")))
        groups.setdefault(key, []).append(chunk)

    kept, dropped = [], 0
    for group in groups.values():
        preferred = [c for c in group if c["lang"] == prefer]
        if preferred and len(preferred) < len(group):
            dropped += len(group) - len(preferred)
            kept.extend(preferred)
        else:
            kept.extend(group)
    return kept, dropped


def crawl(locale: str, max_pages: int, delay: float, wait_ms: int, overlap: int):
    queue = deque([BASE + "/"])
    visited: set[str] = set()
    chunks: list[dict] = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(ignore_https_errors=True)
        context.add_cookies([{
            "name": "NEXT_LOCALE", "value": locale, "domain": MAIN_HOST, "path": "/",
        }])
        page = context.new_page()

        while queue and len(visited) < max_pages:
            url = queue.popleft()
            key = normalize_url(url)
            if key in visited or not in_scope(urlparse(url).netloc):
                continue
            visited.add(key)

            try:
                resp = page.goto(url, wait_until="networkidle", timeout=40000)
            except Exception as exc:
                print(f"  [skip] {url[:80]} ({str(exc)[:45]})")
                continue
            if resp is None or resp.status != 200:
                print(f"  [skip] {url[:80]} (HTTP {resp.status if resp else '?'})")
                continue

            page.wait_for_timeout(wait_ms)
            html = page.content()
            data = page.evaluate(EXTRACT_JS)
            text = re.sub(r"\s+", " ", data.get("text") or "").strip()

            for a in BeautifulSoup(html, "html.parser").find_all("a", href=True):
                link = urljoin(url, a["href"].strip())
                parsed = urlparse(link)
                if parsed.scheme not in ("http", "https") or not in_scope(parsed.netloc):
                    continue
                if any(parsed.path.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
                    continue
                if normalize_url(link) not in visited:
                    queue.append(link)

            # The whole strategy: one window size, one overlap, every page.
            pieces = chunk_text(text, max_words=MAX_WORDS, overlap=overlap)
            stem = id_stem(key)
            for i, piece in enumerate(pieces, start=1):
                chunks.append({
                    "chunk_id": f"base_{stem}_c{i:02d}",
                    "content": piece,     # embedded as-is: no breadcrumb
                    "raw": piece,
                    "title": (data.get("title") or "").strip(),
                    "url": key,
                    "collection": collection_of(key),
                    "page_type": collection_of(key),
                    "published_at": None,
                    "lang": guess_lang(piece),
                    "section": None,
                })
            print(f"  [ok]   {key[:74]} -> {len(pieces)} chunks")

            if delay:
                time.sleep(delay)

        browser.close()

    print(f"\nHosts crawled: {sorted({urlparse(c['url']).netloc for c in chunks})}")
    return chunks


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--locale", default="en")
    parser.add_argument("--max-pages", type=int, default=400)
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument("--wait-ms", type=int, default=1800)
    parser.add_argument("--max-words", type=int, default=MAX_WORDS)
    parser.add_argument("--overlap", type=int, default=None,
                        help="Words of overlap between windows (default: ~12%%, 15-40)")
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    args = parser.parse_args()

    overlap = pick_overlap(args.max_words, args.overlap)
    print(f"Baseline crawl of {BASE} (locale={args.locale}, "
          f"max_words={args.max_words}, overlap={overlap})")

    chunks = crawl(args.locale, args.max_pages, args.delay, args.wait_ms, overlap)
    chunks, dropped = dedupe_by_language(chunks, prefer=args.locale)
    print(f"Dropped {dropped} chunks from pages that also exist in '{args.locale}'")

    with open(args.output, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
    print(f"Wrote {len(chunks)} chunks to {args.output}")


if __name__ == "__main__":
    main()
