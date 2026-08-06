from __future__ import annotations

import copy
import logging
import re
from typing import Optional

from bs4 import BeautifulSoup
from bs4.element import Tag

from crawler.parser.base_parser import BaseParser

logger = logging.getLogger(__name__)


class BaseHTMLParser(BaseParser):
    """
    Base class for all HTML parsers.

    Contains only common helper methods.
    """

    REMOVE_TAGS = [
        "script",
        "style",
        "noscript",
        "iframe",
        "svg",
    ]

    REMOVE_CLASSES = [
        "breadcrumb",
        "share",
        "social",
        "footer",
        "header",
        "sidebar",
        "pagination",
    ]

    # --------------------------------------------------
    # BeautifulSoup
    # --------------------------------------------------

    def create_soup(self, html: str) -> BeautifulSoup:
        """
        Create BeautifulSoup object.
        """

        return BeautifulSoup(html, "lxml")

    # --------------------------------------------------
    # Clone
    # --------------------------------------------------

    def clone(self, tag: Tag) -> Tag:
        """
        Deep copy html node.
        """

        return copy.deepcopy(tag)

    # --------------------------------------------------
    # Safe Select
    # --------------------------------------------------

    def select_one(
        self,
        root: Tag | BeautifulSoup,
        selector: str,
    ) -> Optional[Tag]:

        return root.select_one(selector)

    # --------------------------------------------------
    # Safe Text
    # --------------------------------------------------

    def safe_text(
        self,
        node: Tag | None,
    ) -> str:

        if node is None:
            return ""

        return self.normalize_text(node.get_text(separator="\n"))

    # --------------------------------------------------
    # Safe Attr
    # --------------------------------------------------

    def safe_attr(
        self,
        node: Tag | None,
        attr: str,
    ) -> str:

        if node is None:
            return ""

        return node.attrs.get(attr, "")

    # --------------------------------------------------
    # Meta
    # --------------------------------------------------

    def get_meta(
        self,
        soup: BeautifulSoup,
        name: str,
    ) -> str:

        tag = soup.find(
            "meta",
            attrs={"name": name},
        )

        if tag is None:
            return ""

        return tag.attrs.get("content", "")

    # --------------------------------------------------
    # Remove Tags
    # --------------------------------------------------

    def remove_noise(
        self,
        root: Tag,
    ) -> Tag:

        # remove tag

        for tag_name in self.REMOVE_TAGS:

            for tag in root.find_all(tag_name):

                tag.decompose()

        # remove class

        for cls in self.REMOVE_CLASSES:

            for tag in root.select(f".{cls}"):

                tag.decompose()

        return root

    # --------------------------------------------------
    # Normalize Text
    # --------------------------------------------------

    def normalize_text(
        self,
        text: str,
    ) -> str:

        if not text:
            return ""

        text = text.replace("\xa0", " ")

        text = text.replace("\r", "")

        text = re.sub(r"[ \t]+", " ", text)

        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    # --------------------------------------------------
    # Clean HTML
    # --------------------------------------------------

    def clean_html(
        self,
        root: Tag,
    ) -> str:

        clone = self.clone(root)

        self.remove_noise(clone)

        return self.safe_text(clone)

    # --------------------------------------------------
    # Logging
    # --------------------------------------------------

    def log(self, message: str):

        logger.info(message)
