from pathlib import Path

from crawler.parser.static_parser import StaticParser

html = Path("data/raw_html/about/welcome-message.html").read_text(encoding="utf-8")

parser = StaticParser()

data = parser.parse(html, "https://fintech.hust.edu.vn/about/welcome-message")

print(data["title"])

print(data["content"][:300])
