"""Smart search service: semantic (vector) + keyword fallback across modules."""

from __future__ import annotations

from typing import Dict, List, Optional

from app.core.logging import get_logger
from app.repositories.document_repo import DocumentRepository
from app.repositories.export_repo import ExportRepository
from app.repositories.note_repo import NoteRepository
from app.services.embedding_service import EmbeddingService

logger = get_logger(__name__)


def _snippet(text: str, query: str, length: int = 200) -> str:
    text = (text or "").replace("\n", " ").strip()
    if not text:
        return ""
    lowered = text.lower()
    pos = lowered.find(query.lower())
    if pos == -1:
        return text[:length]
    start = max(0, pos - length // 3)
    return ("…" if start > 0 else "") + text[start : start + length]


class SearchService:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        doc_repo: DocumentRepository,
        note_repo: NoteRepository,
        export_repo: ExportRepository,
    ) -> None:
        self.embedding_service = embedding_service
        self.doc_repo = doc_repo
        self.note_repo = note_repo
        self.export_repo = export_repo

    def search(self, query: str, types: Optional[List[str]] = None) -> List[Dict[str, object]]:
        wanted = set(types) if types else {"documents", "notes", "exports"}
        results: List[Dict[str, object]] = []
        seen_docs: set[int] = set()

        # 1) Semantic search over indexed document chunks.
        if "documents" in wanted:
            for hit in self.embedding_service.query(query, top_k=6):
                doc_id = hit.get("document_id")
                if isinstance(doc_id, int) and doc_id in seen_docs:
                    continue
                if isinstance(doc_id, int):
                    seen_docs.add(doc_id)
                results.append(
                    {
                        "type": "document",
                        "title": str(hit.get("source", "Document")),
                        "snippet": str(hit.get("text", ""))[:200],
                        "score": float(hit.get("score", 0.0)),
                        "id": int(doc_id) if isinstance(doc_id, int) else 0,
                        "module": "documents",
                    }
                )

        q = query.lower()

        # 2) Keyword fallback over documents (covers unindexed content).
        if "documents" in wanted:
            for doc in self.doc_repo.list():
                if doc.id in seen_docs:
                    continue
                haystack = f"{doc.name}\n{doc.extracted_text}".lower()
                if q in haystack:
                    seen_docs.add(doc.id)
                    results.append(
                        {
                            "type": "document",
                            "title": doc.name,
                            "snippet": _snippet(doc.extracted_text or doc.name, query),
                            "score": 0.5,
                            "id": doc.id,
                            "module": "documents",
                        }
                    )

        # 3) Keyword search over notes.
        if "notes" in wanted:
            for note in self.note_repo.all_ordered():
                haystack = f"{note.title}\n{note.content}".lower()
                if q in haystack:
                    results.append(
                        {
                            "type": "note",
                            "title": note.title,
                            "snippet": _snippet(note.content, query),
                            "score": 0.55,
                            "id": note.id,
                            "module": "workspace",
                        }
                    )

        # 4) Keyword search over exports.
        if "exports" in wanted:
            for exp in self.export_repo.all_ordered():
                if q in exp.filename.lower() or q in (exp.title or "").lower():
                    results.append(
                        {
                            "type": "export",
                            "title": exp.title or exp.filename,
                            "snippet": exp.filename,
                            "score": 0.4,
                            "id": exp.id,
                            "module": "exports",
                        }
                    )

        results.sort(key=lambda r: r["score"], reverse=True)
        return results
