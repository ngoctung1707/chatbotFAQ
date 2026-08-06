"""Chunking strategies shared by every ingester (API, website, PDF books).

The site is mostly short structured records — staff lists, course modules,
solution cards — not long prose. A single sliding window with overlap suits
long articles but hurts records: the overlap drags the tail of one person's
entry into the next, so "who is the Vice-Dean?" retrieves a chunk naming two
people. So each content shape gets its own splitter, and only real prose
(news articles) keeps an overlap — at sentence boundaries, never mid-syllable,
which matters for Vietnamese.

What overlap used to buy on the rest of the site — a chunk knowing what it
belongs to — is provided instead by `build_context_header`, prepended to the
text that gets embedded. It costs ~15 tokens instead of ~20% of the index.
"""
import re
import unicodedata

# Sentence ends. Vietnamese uses the same terminators as English.
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def pick_overlap(max_words: int, requested: int = None) -> int:
    """Keep overlap within the 15-40 word band, scaled to ~12% of chunk size."""
    if requested is not None:
        return max(15, min(40, requested))
    return max(15, min(40, round(max_words * 0.12)))


def chunk_text(text: str, max_words: int, overlap: int):
    """Fixed word window. Used for book pages, where prose runs long and even."""
    words = text.split()
    if not words:
        return []
    if len(words) <= max_words:
        return [" ".join(words)]

    chunks = []
    start = 0
    n = len(words)
    while start < n:
        end = min(start + max_words, n)
        chunks.append(" ".join(words[start:end]))
        if end == n:
            break
        start = end - overlap
    return chunks


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_SPLIT.split(text) if s.strip()]


def chunk_prose(text: str, max_words: int = 250, overlap_sentences: int = 1) -> list[str]:
    """Sentence-aligned window for articles.

    Cutting on sentence boundaries keeps the overlap readable and avoids
    splitting a Vietnamese syllable, which a character-based splitter would do.
    """
    sentences = split_sentences(text)
    if not sentences:
        return []

    chunks = []
    current: list[str] = []
    current_words = 0

    for sentence in sentences:
        words = len(sentence.split())
        # A sentence that alone busts the budget (list-like prose with no full
        # stops) can never fit, so fall back to a word window for just that one.
        if words > max_words:
            if current:
                chunks.append(" ".join(current))
                current, current_words = [], 0
            chunks.extend(chunk_text(sentence, max_words, pick_overlap(max_words)))
            continue
        if current and current_words + words > max_words:
            chunks.append(" ".join(current))
            carry = current[-overlap_sentences:] if overlap_sentences else []
            carry_words = sum(len(s.split()) for s in carry)
            # Overlap is a nice-to-have; the size limit is not. Drop the carried
            # sentence rather than let it push this chunk over the budget.
            if carry_words + words > max_words:
                carry, carry_words = [], 0
            current = list(carry)
            current_words = carry_words
        current.append(sentence)
        current_words += words

    if current:
        chunks.append(" ".join(current))
    return chunks


def _record_words(records: list[str]) -> int:
    """Size of the rendered chunk, not of the records alone.

    `" | ".join` puts a bare pipe between records, and `str.split()` counts that
    pipe as a word — so n records carry n-1 extra tokens. Budgeting on the raw
    sum lets a chunk render a few words over the limit.
    """
    return sum(len(r.split()) for r in records) + max(0, len(records) - 1)


def chunk_records(records: list[str], min_words: int = 30, max_words: int = 250) -> list[str]:
    """Pack records up to the budget, never overlapping and never mid-record.

    `min_words` used to close a chunk the moment the buffer reached it, so a
    staff page came out as 30-word slivers and `max_words` was unreachable.
    Worse than the size: this site emits a person's name and their title as two
    *separate* records, so a cut at 30 words landed between them —
    `/about/institute-council` had "Assoc. Prof. Nguyen Binh Minh" ending one
    chunk and "(Dean, …)" opening the next, and no chunk said who the Dean was.

    So the threshold is a floor on the last chunk, not a trigger. Packing to the
    budget also keeps each name beside its title, since the cut now falls where
    250 words run out rather than every 30.

    Still no overlap: a record must appear in exactly one chunk, or "who is the
    Vice-Dean?" matches two chunks naming different people.
    """
    groups: list[list[str]] = []
    buffer: list[str] = []

    for record in records:
        record = record.strip()
        if not record:
            continue
        words = len(record.split())

        # A record over budget on its own cannot be packed with anything.
        if words > max_words:
            if buffer:
                groups.append(buffer)
                buffer = []
            for piece in chunk_prose(record, max_words=max_words, overlap_sentences=0):
                groups.append([piece])
            continue

        # Measure the buffer *with* the record in it: appending adds a separator
        # too, so adding the raw word count would miss it and overshoot by one.
        if buffer and _record_words(buffer + [record]) > max_words:
            groups.append(buffer)
            buffer = []
        buffer.append(record)

    if buffer:
        groups.append(buffer)

    # Only the final group can end far under budget; every other one was closed
    # by a record that did not fit.
    if len(groups) >= 2:
        merged = groups[-2] + groups[-1]
        if _record_words(groups[-1]) < min_words and _record_words(merged) <= max_words:
            groups[-2:] = [merged]

    return [" | ".join(group) for group in groups]


def _section_words(parts: list[tuple]) -> int:
    """Size of what `_render_section_chunk` would produce, not of the raw text.

    Packing has to budget for the inline "Heading: " labels, which only appear
    once a chunk holds more than one section — counting the raw text alone
    overshoots the limit by however long the headings are.
    """
    if len(parts) == 1:
        return len(parts[0][1].split())
    return sum(
        len(text.split()) + (len(heading.split()) if heading else 0)
        for heading, text in parts
    )


def _render_section_chunk(parts: list[tuple]) -> dict:
    """Turn the sections packed into one chunk back into {"heading", "text"}."""
    if len(parts) == 1:
        heading, text = parts[0]
        return {"heading": heading, "text": text}
    # No single heading describes the chunk any more, so the caller's context
    # header falls back to the page title. The section names are not lost —
    # they stay as inline labels so the structure survives inside the text.
    labelled = [f"{heading}: {text}" if heading else text for heading, text in parts]
    return {"heading": None, "text": " ".join(labelled)}


def chunk_sections(
    sections: list[dict], max_words: int = 250, min_words: int = 80
) -> list[dict]:
    """Pack consecutive heading sections up to the budget, one chunk each.

    Splitting on every heading and stopping there is what this used to do, and
    it shredded the site: a course page of 306 words came out as six chunks of
    ~51 words, none of which represented the course. Sections here are facets of
    one thing — Overview, Course Structure, Certification — so they belong
    together until the budget says otherwise, exactly as `chunk_records` merges
    short records.

    `sections` is [{"heading": str|None, "text": str}] and the same shape comes
    back, with `heading` set to None once a chunk spans more than one section.

    Oversized sections still split on sentence boundaries; a trailing scrap too
    small to embed usefully rejoins the chunk before it.
    """
    groups: list[list[tuple]] = []
    buffer: list[tuple] = []

    for section in sections:
        text = (section.get("text") or "").strip()
        if not text:
            continue
        heading = section.get("heading")

        # A section over budget can never be packed with anything, so it closes
        # whatever was accumulating and becomes chunks of its own.
        if len(text.split()) > max_words:
            if buffer:
                groups.append(buffer)
                buffer = []
            for piece in chunk_prose(text, max_words=max_words, overlap_sentences=0):
                groups.append([(heading, piece)])
            continue

        if buffer and _section_words(buffer + [(heading, text)]) > max_words:
            groups.append(buffer)
            buffer = []
        buffer.append((heading, text))

    if buffer:
        groups.append(buffer)

    # The last group is the only one that can end up far under budget, because
    # every other one was closed by a section that did not fit. Fold it back if
    # the pair still fits — a 20-word remnant embeds to noise.
    if len(groups) >= 2:
        merged = groups[-2] + groups[-1]
        if _section_words(groups[-1]) < min_words and _section_words(merged) <= max_words:
            groups[-2:] = [merged]

    return [_render_section_chunk(group) for group in groups]


def build_context_header(*parts: str, depth: int = 2) -> str:
    """Breadcrumb prefixed to the embedded text so a chunk carries its origin.

    "Module 1: Overview of Fintech" alone embeds no signal that it belongs to
    the Fintech course; the header supplies it.

    Only the last `depth` levels are kept. The outer levels ("BKFintech",
    "courses") repeat on nearly every chunk, and a string present in ~100% of
    documents carries no information to rank on — it just pulls every vector in
    the same direction and flattens the differences that retrieval depends on.
    Measured on the real corpus, trimming to the last two levels moved the
    correct answer up for the site's most common questions.
    """
    seen = []
    for part in parts:
        part = (part or "").strip()
        if not part:
            continue
        if any(part.lower() == s.lower() for s in seen):
            continue
        seen.append(part)
    seen = seen[-depth:] if depth else seen
    return "[" + " > ".join(seen) + "]" if seen else ""


def with_context(header: str, text: str) -> str:
    return f"{header}\n{text}" if header else text


_SLUG_STRIP = re.compile(r"[^a-z0-9]+")


def slugify(value: str, max_len: int = 48) -> str:
    """Readable, filesystem-safe fragment for a chunk id.

    Ids are read by humans tracing a bad answer back to its page, so they spell
    out where the chunk came from instead of hashing it.
    """
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    value = value.replace("đ", "d").replace("Đ", "D")
    value = _SLUG_STRIP.sub("-", value.lower()).strip("-")
    return value[:max_len].strip("-") or "untitled"


def make_chunk_id(source: str, *parts: str, index: int) -> str:
    """e.g. web_courses_fintech-course-en_c03 — source, path, position."""
    slugs = [slugify(p) for p in parts if p]
    return "_".join([source, *slugs, f"c{index:02d}"])
