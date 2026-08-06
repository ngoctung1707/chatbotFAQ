from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class Document:
    """
    Standard document produced by every parser.

    This is the unified data format before cleaning and chunking.
    """

    id: str
    url: str

    page_type: str
    collection: str
    language: str = "en"

    title: str = ""
    description: str = ""
    published_at: str | None = None

    content: str = ""

    metadata: dict[str, Any] = field(default_factory=dict)

    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    # ----------------------------------------------------
    # Validation
    # ----------------------------------------------------

    def validate(self) -> None:
        """
        Validate required fields.

        Raises
        ------
        ValueError
            If document is invalid.
        """

        if not self.url:
            raise ValueError("Document.url cannot be empty.")

        if not self.page_type:
            raise ValueError("Document.page_type cannot be empty.")

        if not self.collection:
            raise ValueError("Document.collection cannot be empty.")

        if not self.title:
            raise ValueError(f"Missing title ({self.url})")

        if not self.content:
            raise ValueError(f"Missing content ({self.url})")

        if len(self.content.strip()) < 30:
            raise ValueError(f"Content too short ({self.url})")

    # ----------------------------------------------------
    # Export
    # ----------------------------------------------------

    def to_dict(self) -> dict:
        return asdict(self)
