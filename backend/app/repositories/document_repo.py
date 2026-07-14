"""Document repository."""

from __future__ import annotations

from typing import List

from sqlalchemy import func, select

from app.db.models import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    model = Document

    def recent(self, limit: int = 5) -> List[Document]:
        stmt = select(Document).order_by(Document.created_at.desc()).limit(limit)
        return list(self.session.scalars(stmt).all())

    def total_chunks(self) -> int:
        return int(self.session.scalar(select(func.coalesce(func.sum(Document.chunk_count), 0))) or 0)
