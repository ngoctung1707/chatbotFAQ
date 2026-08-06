from __future__ import annotations

from abc import ABC, abstractmethod

from crawler.schema import Document


class BaseParser(ABC):
    """
    Base interface for every parser.
    """

    @abstractmethod
    def parse(self, html: str, url: str) -> Document:
        """
        Parse HTML into a Document.
        """
        raise NotImplementedError
