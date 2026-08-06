from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from crawler.schema import Document


def save_document(
    document: Document,
    output_path: str,
):

    path = Path(output_path)

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            asdict(document),
            f,
            ensure_ascii=False,
            indent=4,
        )
