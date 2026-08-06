from __future__ import annotations

import re

from crawler.schema import Document


class Cleaner:

    def clean(self, document: Document) -> Document:
        """
        Clean a parsed document.
        """

        document.title = self._clean_text(document.title)

        document.description = self._clean_text(document.description)

        document.content = self._clean_text(document.content)

        return document

    def _clean_text(self, text: str) -> str:

        if not text:
            return ""

        # Remove invisible unicode characters
        text = (
            text.replace("\u200b", "")
            .replace("\u200c", "")
            .replace("\u200d", "")
            .replace("\ufeff", "")
            .replace("\xa0", " ")
        )

        # Normalize line endings
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")

        # Remove trailing spaces
        text = re.sub(r"[ \t]+", " ", text)

        # Remove too many blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()
