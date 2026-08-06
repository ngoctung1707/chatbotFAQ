"""Crawl fintech.hust.edu.vn (plus the ECOTECH sites it links out to) into chunks.

Language
--------
The site keeps the reader's choice in a NEXT_LOCALE cookie, so English is asked
for up front. Not every page is translated: when a page still renders Vietnamese
under an English locale, that Vietnamese text *is* the only version and is kept.
Course pages exist as separate URLs per language (…-en / …-vie); those pairs are
collapsed to the English one, and a page with no English twin survives.

Scope
-----
Everything under fintech.hust.edu.vn, plus hosts containing "ecotech" — the
conference lives on its own domain and is linked from Get Involved. Other
product subdomains (bkoffice, bksign, ediploma, aipad) are deliberately left
out: they are login screens for separate applications.

Chunking
--------
Routed by page type, because the shapes differ. Staff and publication pages are
lists of short independent records; running one sliding window over them splices
the tail of one person onto the next, so "who is the Vice-Dean?" can retrieve a
chunk naming three people. Course pages are already divided by headings. Only
narrative pages keep an overlap, and it moves whole sentences — a character
overlap would cut through Vietnamese syllables.

News and solutions are skipped here: the CMS API serves the same articles with
no page chrome (see ingest_api.py). Links on those pages are still followed.

Usage:
    python scripts/crawl_fintech.py
    python scripts/crawl_fintech.py --locale vi --max-pages 100
"""
import argparse
import json
import re
import sys
import time
from collections import deque
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.chunking import (
    build_context_header,
    chunk_prose,
    chunk_records,
    chunk_sections,
    make_chunk_id,
    with_context,
)

BASE = "https://fintech.hust.edu.vn"
MAIN_HOST = urlparse(BASE).netloc
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_PATH = DATA_DIR / "chunks_web.jsonl"

MAX_WORDS = 250

SKIP_EXTENSIONS = (
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp", ".css", ".js",
    ".json", ".xml", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".zip", ".rar", ".mp4", ".mp3", ".avi", ".mov", ".woff", ".woff2", ".ttf", ".eot",
)

# Links are still followed from these; only their text is left out.
SKIP_PATH_PATTERNS = (
    re.compile(r"^/news(/|$)"),        # CMS API serves the same articles, chrome-free
    re.compile(r"^/solutions(/|$)"),   # ditto
    re.compile(r"/pages/\d+$"),        # paginated view of a list already crawled
    re.compile(r"%25"),                # double-encoded links the site emits; they 404
)

# The site's own links to these are double-encoded and dead; they resolve when
# requested directly. Seeding both languages lets the dedupe pick the English one.
EXTRA_SEEDS = (
    "/courses/fintech-course-vie",
    "/courses/ai-for-everyone-vie",
    "/courses/business-intelligence-vie",
    "/courses/level-up-it-vie",
)

PAGE_TYPE_RULES = [
    (re.compile(r"^/about/(board-of-deans|advisory-board|institute-council|researchers|back-office)"), "people"),
    (re.compile(r"^/courses/"), "course"),
    (re.compile(r"^/research/publications"), "publication"),
    (re.compile(r"^/research/r&d-labs/"), "lab"),
    (re.compile(r"^/research"), "research"),
    (re.compile(r"^/get-involved"), "event"),
    (re.compile(r"^/academic"), "academic"),
    (re.compile(r"^/about"), "static"),
    (re.compile(r"^/$"), "home"),
]

FILTER_TOKEN = re.compile(r"^(All|Tất cả|20\d\d)$", re.I)
VN_DIACRITICS = re.compile(r"[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]")
LANG_SUFFIX = re.compile(r"[-_](en|eng|english|vi|vie|vn)$", re.I)

# Share links carry tracking that does not change the page; keeping it makes
# "/" and "/?fbclid=…" look like two pages. ?user= does change the page, so it stays.
TRACKING_PARAMS = re.compile(r"^(fbclid|gclid|msclkid|ref|utm_[a-z_]+)$", re.I)

DATE_PATTERNS = [
    (re.compile(r"(\d{4})-(\d{2})-(\d{2})"), "ymd"),
    (re.compile(r"(\d{2})/(\d{2})/(\d{4})"), "dmy"),
]

HEADING_TAGS = {"H1", "H2", "H3", "H4"}

# Reads the page as headings + blocks + repeated "cards". Chrome is skipped
# rather than removed so pagination controls stay clickable for a second pass.
EXTRACT_JS = r"""
() => {
  const root = document.querySelector('main') || document.body;
  if (!root) return {title: '', lang: '', blocks: [], records: []};

  const clean = s => (s || '').trim().replace(/\s+/g, ' ');
  const CHROME = 'script,style,nav,footer,header,noscript,form,svg,aside,' +
    '[class*="menu"],[class*="navbar"],[class*="breadcrumb"],[class*="cookie"],' +
    '[class*="pagination"],[class*="page-item"],[class*="page-link"],[class*="filter"]';
  const isChrome = el => el.closest(CHROME) !== null;

  const blocks = [];
  root.querySelectorAll('h1,h2,h3,h4,h5,p,li,td,blockquote,figcaption').forEach(el => {
    if (el.querySelector('h1,h2,h3,h4,h5,p,li,td')) return;   // leaves only
    if (isChrome(el)) return;
    const t = clean(el.innerText);
    if (t) blocks.push({tag: el.tagName, text: t});
  });

  // Repeated sibling containers are cards — one staff member, one publication.
  // Grouping by them keeps each record whole and apart from its neighbours.
  const groups = new Map();
  root.querySelectorAll('*').forEach(el => {
    if (el.children.length || isChrome(el)) return;
    const t = clean(el.innerText);
    if (!t) return;
    let node = el, card = null;
    while (node && node !== root) {
      const parent = node.parentElement;
      if (!parent) break;
      const twins = [...parent.children].filter(
        c => c.tagName === node.tagName && c.className === node.className);
      if (twins.length >= 2) { card = node; break; }
      node = parent;
    }
    if (card) {
      if (!groups.has(card)) groups.set(card, []);
      groups.get(card).push(t);
    }
  });

  // document.title is the same site-wide string on every page, so the real
  // title has to come from the first on-page heading.
  const headingEl = [...root.querySelectorAll('h1,h2')].find(el => !isChrome(el));

  return {
    title: headingEl ? clean(headingEl.innerText) : clean(document.title),
    lang: document.documentElement.lang || '',
    blocks,
    records: [...groups.values()].map(parts => parts.join(' ')),
  };
}
"""

# Paged lists advance in place without changing the URL.
PAGINATE_JS = r"""
(n) => {
  const links = [...document.querySelectorAll('.page-link, .page-item a, .pagination a')]
    .filter(e => (e.innerText || '').trim() === String(n));
  if (!links.length) return false;
  links[links.length - 1].click();
  return true;
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
    """The main site, plus the ECOTECH conference on its own domain."""
    return netloc == MAIN_HOST or "ecotech" in netloc.lower()


def classify(url: str) -> str:
    if "ecotech" in urlparse(url).netloc.lower():
        return "event"
    path = urlparse(url).path
    for pattern, page_type in PAGE_TYPE_RULES:
        if pattern.search(path):
            return page_type
    return "static"


def should_skip(url: str) -> bool:
    if urlparse(url).netloc != MAIN_HOST:
        return False
    return any(p.search(urlparse(url).path) for p in SKIP_PATH_PATTERNS)


def is_filter_widget(text: str) -> bool:
    """Year pickers survive selector-based stripping because the site ships
    hashed jsx class names with nothing semantic to match on, so they are
    recognised by content instead. Each button is its own tiny record ("All",
    "2025", …) and has to go individually — otherwise merging short records
    glues them onto the front of the first real publication.
    """
    tokens = [t for t in re.split(r"[\s|]+", text) if t]
    if not tokens:
        return False
    if len(tokens) <= 2:
        return all(FILTER_TOKEN.match(t) for t in tokens)
    hits = sum(1 for t in tokens if FILTER_TOKEN.match(t))
    return hits >= 3 and hits / len(tokens) > 0.5


def guess_lang(text: str) -> str:
    """Vietnamese diacritics are the cheapest reliable signal here."""
    return "vi" if VN_DIACRITICS.search(text.lower()) else "en"


def extract_published_at(html: str):
    soup = BeautifulSoup(html, "html.parser")
    candidates = []
    for prop in ("article:published_time", "og:published_time", "article:modified_time"):
        tag = soup.find("meta", property=prop)
        if tag and tag.get("content"):
            candidates.append(tag["content"])
    time_tag = soup.find("time")
    if time_tag:
        candidates.append(time_tag.get("datetime") or time_tag.get_text(strip=True))
    for raw in candidates:
        for pattern, order in DATE_PATTERNS:
            match = pattern.search(raw or "")
            if not match:
                continue
            y, mo, d = match.groups() if order == "ymd" else match.groups()[::-1]
            try:
                return datetime(int(y), int(mo), int(d)).strftime("%Y-%m-%d")
            except ValueError:
                continue
    return None


def blocks_to_sections(blocks) -> list[dict]:
    sections, heading, buffer = [], None, []

    def flush():
        text = " ".join(buffer).strip()
        if text:
            sections.append({"heading": heading, "text": text})

    for block in blocks:
        if block["tag"] in HEADING_TAGS:
            flush()
            buffer = []
            heading = block["text"]
            continue
        buffer.append(block["text"])
    flush()
    return sections


def id_parts(url: str) -> list[str]:
    """Human-readable id components: the path, then the query.

    They stay separate because each part is truncated on its own — folded into
    one string, a long path eats the query, and the cyber-clinic personas
    (?user=student|teacher|business) would all collapse onto the same id.
    """
    parsed = urlparse(url)
    if "ecotech" in parsed.netloc.lower():
        stem = "ecotech-" + (Path(parsed.path).stem or "home")
    else:
        # Only the last few segments: the leading ones are shared by whole
        # branches of the site, so a truncated full path collapses a page and
        # its children onto the same id.
        segments = [s for s in parsed.path.split("/") if s]
        stem = "-".join(segments[-3:]) or "home"
    return [stem, parsed.query] if parsed.query else [stem]


def page_to_chunks(data, url, published_at) -> list[dict]:
    page_type = classify(url)
    title = re.sub(r"\s*[|–-]\s*BK ?Fintech.*$", "", data.get("title") or "").strip()

    pieces: list[dict] = []

    if page_type in ("people", "publication"):
        records = [r for r in data.get("records", []) if r.strip() and not is_filter_widget(r)]
        if not records:
            records = [b["text"] for b in data.get("blocks", []) if b["tag"] not in HEADING_TAGS]
        # No overlap: one record must never leak into the next.
        for text in chunk_records(records, min_words=30, max_words=MAX_WORDS):
            pieces.append({"heading": None, "text": text})
    else:
        sections = blocks_to_sections(data.get("blocks", []))
        if page_type == "home":
            # Only the hero is unique to the home page; the cards below it are
            # teasers for pages indexed in their own right.
            sections = sections[:1]
        if page_type == "static":
            for section in sections:
                for text in chunk_prose(section["text"], MAX_WORDS, overlap_sentences=1):
                    pieces.append({"heading": section["heading"], "text": text})
        else:
            pieces = chunk_sections(sections, max_words=MAX_WORDS)

    stem_parts = id_parts(url)
    out = []
    for i, piece in enumerate(pieces, start=1):
        text = piece["text"].strip()
        if len(text.split()) < 8:  # a stray label carries no answerable content
            continue
        out.append({
            "chunk_id": make_chunk_id("web", *stem_parts, index=i),
            "content": with_context(build_context_header(title, piece.get("heading")), text),
            "raw": text,
            "title": title,
            "url": url,
            "collection": page_type,
            "page_type": page_type,
            "published_at": published_at,
            "lang": guess_lang(text),
            "section": piece.get("heading"),
        })
    return out


def dedupe_by_language(chunks, prefer="en"):
    """Collapse a page that exists in both languages down to the preferred one.

    Course pages ship as URL variants (…-en / …-vie), so stripping the language
    suffix groups the twins. A page with no twin in the preferred language is
    kept as it is — that is how Vietnamese-only pages survive an English crawl.
    """
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


def discover_sitemap() -> list[str]:
    for name in ("/sitemap.xml", "/sitemap_index.xml"):
        try:
            resp = requests.get(urljoin(BASE, name), timeout=15)
        except requests.RequestException:
            continue
        if resp.status_code != 200 or "xml" not in resp.headers.get("Content-Type", ""):
            continue
        soup = BeautifulSoup(resp.content, "html.parser")
        locs = [loc.get_text(strip=True) for loc in soup.find_all("loc")]
        if locs:
            return locs
    return []


def crawl(locale: str, max_pages: int, delay: float, wait_ms: int):
    seeds = [BASE + "/"] + discover_sitemap() + [BASE + p for p in EXTRA_SEEDS]
    seeds.append("https://ecotech.bkfin.tech/")
    queue = deque(seeds)
    visited: set[str] = set()
    chunks: list[dict] = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context()
        # The site defaults to English but remembers the reader's choice in a
        # cookie; setting it is what makes the whole crawl one language.
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

            # Decided before fetching. Article pages are covered by the CMS API
            # and carry only the site-wide navigation, which every other page
            # already contributes — loading ~110 of them to discover nothing new
            # was the bulk of the crawl's running time.
            if should_skip(url):
                print(f"  [pass] {urlparse(url).path[:70]} (covered by API / duplicate listing)")
                continue

            try:
                resp = page.goto(url, wait_until="networkidle", timeout=40000)
            except Exception as exc:
                print(f"  [skip] {url[:80]} ({str(exc)[:50]})")
                continue
            if resp is None or resp.status != 200:
                print(f"  [skip] {url[:80]} (HTTP {resp.status if resp else '?'})")
                continue

            page.wait_for_timeout(wait_ms)
            html = page.content()

            # Queue links before the extractor ignores the navigation, so every
            # directory and sub-directory is still reached.
            soup = BeautifulSoup(html, "html.parser")
            for a in soup.find_all("a", href=True):
                link = urljoin(url, a["href"].strip())
                parsed = urlparse(link)
                if parsed.scheme not in ("http", "https") or not in_scope(parsed.netloc):
                    continue
                if any(parsed.path.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
                    continue
                if normalize_url(link) not in visited:
                    queue.append(link)

            data = page.evaluate(EXTRACT_JS)

            if classify(url) == "publication":
                for n in range(2, 21):
                    if not page.evaluate(PAGINATE_JS, n):
                        break
                    page.wait_for_timeout(1200)
                    more = page.evaluate(EXTRACT_JS)
                    data["records"].extend(more.get("records", []))
                    data["blocks"].extend(more.get("blocks", []))

            page_chunks = page_to_chunks(data, key, extract_published_at(html))
            chunks.extend(page_chunks)
            langs = {c["lang"] for c in page_chunks}
            print(f"  [ok]   {key.replace(BASE, '')[:70]} -> {len(page_chunks)} chunks "
                  f"({classify(url)}, {'/'.join(sorted(langs)) or '-'})")

            if delay:
                time.sleep(delay)

        browser.close()

    return chunks


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--locale", default="en", help="NEXT_LOCALE to request (default: en)")
    parser.add_argument("--max-pages", type=int, default=400)
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument("--wait-ms", type=int, default=1800)
    parser.add_argument("--output", default=str(OUTPUT_PATH))
    args = parser.parse_args()

    print(f"Crawling {BASE} + ecotech (locale={args.locale})")
    chunks = crawl(args.locale, args.max_pages, args.delay, args.wait_ms)

    chunks, dropped = dedupe_by_language(chunks, prefer=args.locale)
    print(f"\nDropped {dropped} chunks from pages that also exist in '{args.locale}'")

    with open(args.output, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
    print(f"Wrote {len(chunks)} chunks to {args.output}")


if __name__ == "__main__":
    main()
