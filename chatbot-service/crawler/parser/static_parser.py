from __future__ import annotations

from crawler.schema import Document
from crawler.constants import (
    Collection,
    PageType,
)

from .base_parser import BaseParser
from .utils import (
    generate_id,
    make_soup,
    normalize_text,
)


class StaticParser(BaseParser):

    def parse(
        self,
        html: str,
        url: str,
    ) -> Document:

        soup = make_soup(html)

        title = ""

        h1 = soup.find("h1")

        if h1:
            title = normalize_text(h1.get_text())

        article = soup.find("article")

        if article:
            content = normalize_text(article.get_text(" "))
        else:
            content = normalize_text(soup.get_text(" "))

        return Document(
            id=generate_id(url),
            url=url,
            page_type=PageType.STATIC,
            collection=Collection.STATIC,
            language="",
            title=title,
            description="",
            published_at=None,
            content=content,
            metadata={},
        )
