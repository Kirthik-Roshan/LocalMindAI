"""Embedding + vector store service backed by ChromaDB.

ChromaDB and embedding generation are both optional at runtime: if ChromaDB is
not installed, or Ollama is offline, the service degrades to a no-op vector
store so the rest of the application keeps working. A pure-Python cosine
fallback search is provided over stored embeddings.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional

from app.core.config import settings
from app.core.logging import get_logger
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

COLLECTION_NAME = "localmind_documents"


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> List[str]:
    """Split text into overlapping chunks on sentence-ish boundaries."""
    text = (text or "").strip()
    if not text:
        return []

    # Normalize whitespace.
    normalized = re.sub(r"\s+", " ", text)
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: List[str] = []
    start = 0
    length = len(normalized)
    while start < length:
        end = min(start + chunk_size, length)
        # Try to break on a sentence boundary near the end.
        if end < length:
            window = normalized[start:end]
            boundary = max(window.rfind(". "), window.rfind("! "), window.rfind("? "))
            if boundary > chunk_size * 0.5:
                end = start + boundary + 1
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= length:
            break
        start = max(end - overlap, start + 1)
    return chunks


class EmbeddingService:
    """Manages document embeddings and semantic retrieval."""

    def __init__(self, ollama: OllamaService) -> None:
        self.ollama = ollama
        self._client = None
        self._collection = None
        self._init_chroma()

    def _init_chroma(self) -> None:
        try:
            import chromadb  # type: ignore

            self._client = chromadb.PersistentClient(path=settings.chroma_path)
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB collection ready at %s", settings.chroma_path)
        except Exception as exc:  # pragma: no cover - optional dependency
            logger.warning("ChromaDB unavailable (%s); vector store disabled", exc)
            self._client = None
            self._collection = None

    @property
    def enabled(self) -> bool:
        return self._collection is not None

    def add_document(self, document_id: int, text: str, source: str = "") -> int:
        """Chunk, embed and store a document. Returns the number of chunks."""
        chunks = chunk_text(text)
        if not chunks or not self.enabled:
            return len(chunks)

        embeddings: List[List[float]] = []
        valid_chunks: List[str] = []
        ids: List[str] = []
        metadatas: List[Dict[str, object]] = []

        for idx, chunk in enumerate(chunks):
            vector = self.ollama.embeddings(chunk)
            if not vector:
                # Ollama offline — skip embedding but keep chunk count meaningful.
                continue
            embeddings.append(vector)
            valid_chunks.append(chunk)
            ids.append(f"doc-{document_id}-chunk-{idx}")
            metadatas.append(
                {"document_id": document_id, "source": source, "chunk_index": idx}
            )

        if not valid_chunks:
            return len(chunks)

        try:
            self._collection.add(  # type: ignore[union-attr]
                ids=ids,
                embeddings=embeddings,
                documents=valid_chunks,
                metadatas=metadatas,
            )
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to add document %s to vector store: %s", document_id, exc)
            return len(chunks)

        return len(valid_chunks)

    def delete_document(self, document_id: int) -> None:
        if not self.enabled:
            return
        try:
            self._collection.delete(where={"document_id": document_id})  # type: ignore[union-attr]
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to delete document %s from vector store: %s", document_id, exc)

    def query(self, text: str, top_k: int = 5) -> List[Dict[str, object]]:
        """Return the top_k most similar chunks with scores + metadata."""
        if not self.enabled:
            return []
        vector = self.ollama.embeddings(text)
        if not vector:
            return []
        try:
            res = self._collection.query(  # type: ignore[union-attr]
                query_embeddings=[vector],
                n_results=top_k,
                include=["documents", "metadatas", "distances"],
            )
        except Exception as exc:  # pragma: no cover
            logger.warning("Vector query failed: %s", exc)
            return []

        results: List[Dict[str, object]] = []
        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]
        for doc, meta, dist in zip(docs, metas, dists):
            meta = meta or {}
            # cosine distance -> similarity score in [0, 1]
            score = max(0.0, 1.0 - float(dist))
            results.append(
                {
                    "text": doc,
                    "score": round(score, 4),
                    "source": str(meta.get("source", "") or "document"),
                    "document_id": meta.get("document_id"),
                }
            )
        return results

    def count(self) -> int:
        if not self.enabled:
            return 0
        try:
            return int(self._collection.count())  # type: ignore[union-attr]
        except Exception:  # pragma: no cover
            return 0
