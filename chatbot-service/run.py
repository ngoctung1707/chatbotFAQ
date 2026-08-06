from pathlib import Path

from crawler.cleaner import Cleaner
from crawler.chunker import Chunker
from crawler.parser.static_parser import StaticParser

html = Path("data/raw_html/about/welcome-message.html").read_text(encoding="utf-8")

parser = StaticParser()

doc = parser.parse(
    html,
    "https://fintech.hust.edu.vn/about/welcome-message",
)

cleaner = Cleaner()

doc = cleaner.clean(doc)

chunker = Chunker()

chunks = chunker.split(doc)

print(len(chunks))

for chunk in chunks:

    print("=" * 50)

    print(chunk.chunk_index)

    print(chunk.text[:300])
