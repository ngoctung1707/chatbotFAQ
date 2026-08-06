from __future__ import annotations

import hashlib
from bs4 import BeautifulSoup


def make_soup(html: str) -> BeautifulSoup:
    """
    Create BeautifulSoup object.
    """
    return BeautifulSoup(html, "lxml")


def normalize_text(text: str) -> str:
    """
    Normalize whitespace.
    """

    if text is None:
        return ""

    return " ".join(text.split())


def generate_id(url: str) -> str:
    """
    Generate unique id from url.
    """

    return hashlib.md5(url.encode("utf-8")).hexdigest()
