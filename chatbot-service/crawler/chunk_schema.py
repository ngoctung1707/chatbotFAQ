from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Chunk:
    """
    Smallest searchable unit for RAG.
    """

    id: str

    document_id: str

    chunk_index: int

    text: str

    metadata: dict[str, Any] = field(default_factory=dict)
