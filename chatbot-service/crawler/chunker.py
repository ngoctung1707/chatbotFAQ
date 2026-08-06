from __future__ import annotations

from langchain_text_splitters import RecursiveCharacterTextSplitter

from crawler.chunk_schema import Chunk
from crawler.schema import Document


class Chunker:

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
            ],
        )

    def split(
        self,
        document: Document,
    ) -> list[Chunk]:

        texts = self.splitter.split_text(document.content)

        chunks = []

        for index, text in enumerate(texts):

            chunk = Chunk(
                id=f"{document.id}_{index}",
                document_id=document.id,
                chunk_index=index,
                text=text,
                metadata={
                    "url": document.url,
                    "title": document.title,
                    "page_type": document.page_type,
                    "collection": document.collection,
                    "language": document.language,
                },
            )

            chunks.append(chunk)

        return chunks
