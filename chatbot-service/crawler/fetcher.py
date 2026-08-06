from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class Fetcher:
    """
    Responsible for downloading raw HTML from a URL and saving it locally.

    Responsibilities:
        - Download HTML
        - Retry when request fails
        - Save raw HTML
        - Save metadata
    """

    def __init__(
        self,
        output_dir: str = "data/raw_html",
        timeout: int = 20,
    ):
        self.output_dir = Path(output_dir)
        self.timeout = timeout

        self.logger = logging.getLogger(self.__class__.__name__)

        self.session = requests.Session()

        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )

        adapter = HTTPAdapter(max_retries=retry)

        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "Chrome/138.0 Safari/537.36"
            )
        }

    def fetch(self, url: str, page_type: str) -> str:
        """
        Download HTML from URL.

        Parameters
        ----------
        url
            Page URL

        page_type
            news / courses / about ...

        Returns
        -------
        html
        """

        self.logger.info(f"Fetching {url}")

        response = self.session.get(
            url,
            headers=self.headers,
            timeout=self.timeout,
        )

        response.raise_for_status()

        html = response.text

        self._save_html(
            html=html,
            url=url,
            page_type=page_type,
            status_code=response.status_code,
        )

        self.logger.info(f"Finished {url}")

        return html

    def _save_html(
        self,
        html: str,
        url: str,
        page_type: str,
        status_code: int,
    ) -> None:

        folder = self.output_dir / page_type
        folder.mkdir(parents=True, exist_ok=True)

        filename = self._build_filename(url)

        html_path = folder / f"{filename}.html"
        meta_path = folder / f"{filename}.meta.json"

        html_path.write_text(
            html,
            encoding="utf-8",
        )

        metadata = {
            "url": url,
            "page_type": page_type,
            "status_code": status_code,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }

        meta_path.write_text(
            json.dumps(metadata, indent=4),
            encoding="utf-8",
        )

    @staticmethod
    def _build_filename(url: str) -> str:

        path = urlparse(url).path.strip("/")

        if path == "":
            return "index"

        return path.split("/")[-1]