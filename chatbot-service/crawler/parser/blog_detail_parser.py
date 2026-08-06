from __future__ import annotations

import hashlib

from bs4 import BeautifulSoup
from bs4.element import Tag

from crawler.schema import Document
from crawler.parser.base_html_parser import BaseHTMLParser


class BlogDetailParser(BaseHTMLParser):
    """
    Parser for all blog-style detail pages.

    News
    Courses
    Solutions
    Labs
    """

    page_type = "unknown"

    collection = "unknown"

    MAIN_SELECTOR = ".blog__details-content"

    TITLE_SELECTOR = "h2.title"

    # ---------------------------------------------------------
    # Public API
    # ---------------------------------------------------------

    def parse(
        self,
        html: str,
        url: str,
    ) -> Document:

        soup = self.create_soup(html)

        root = self.get_main_content(soup)

        title = self.extract_title(root)

        description = self.extract_description(soup)

        published_at = self.extract_published_at(root)

        content = self.extract_content(root)

        language = self.extract_language(soup)

        document = self.build_document(
            url=url,
            title=title,
            description=description,
            published_at=published_at,
            content=content,
            language=language,
        )

        document.validate()

        return document

    # ---------------------------------------------------------
    # Root
    # ---------------------------------------------------------

    def get_main_content(
        self,
        soup: BeautifulSoup,
    ) -> Tag:

        root = soup.select_one(self.MAIN_SELECTOR)

        if root is None:

            raise ValueError(f"Cannot find {self.MAIN_SELECTOR}")

        return root

    # ---------------------------------------------------------
    # Title
    # ---------------------------------------------------------

    def extract_title(
        self,
        root: Tag,
    ) -> str:

        node = root.select_one(self.TITLE_SELECTOR)

        return self.safe_text(node)

    # ---------------------------------------------------------
    # Description
    # ---------------------------------------------------------

    def extract_description(
        self,
        soup: BeautifulSoup,
    ) -> str:

        description = self.get_meta(
            soup,
            "description",
        )

        return description

    # ---------------------------------------------------------
    # Publish Date
    # ---------------------------------------------------------

    def extract_published_at(
        self,
        root: Tag,
    ) -> str | None:
        """
        Override in child parser if needed.
        """

        return None

    # ---------------------------------------------------------
    # Language
    # ---------------------------------------------------------

    def extract_language(
        self,
        soup: BeautifulSoup,
    ) -> str:

        html = soup.find("html")

        if html is None:

            return "en"

        return html.attrs.get(
            "lang",
            "en",
        )

    # ---------------------------------------------------------
    # Content
    # ---------------------------------------------------------

    def extract_content(
        self,
        root: Tag,
    ) -> str:

        clone = self.clone(root)

        #
        # Remove title
        #

        title = clone.select_one(self.TITLE_SELECTOR)

        if title:

            title.decompose()

        #
        # Remove share
        #

        for cls in [
            ".share",
            ".breadcrumb",
            ".pagination",
            ".social",
        ]:

            for tag in clone.select(cls):

                tag.decompose()

        return self.clean_html(clone)

    # ---------------------------------------------------------
    # Document
    # ---------------------------------------------------------

    def build_document(
        self,
        *,
        url: str,
        title: str,
        description: str,
        published_at: str | None,
        content: str,
        language: str,
    ) -> Document:

        doc_id = hashlib.md5(url.encode("utf-8")).hexdigest()

        return Document(
            id=doc_id,
            url=url,
            page_type=self.page_type,
            collection=self.collection,
            language=language,
            title=title,
            description=description,
            published_at=published_at,
            content=content,
            metadata={},
        )
