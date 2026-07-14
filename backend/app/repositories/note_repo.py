"""Note repository."""

from __future__ import annotations

from typing import List

from sqlalchemy import select

from app.db.models import Note
from app.repositories.base import BaseRepository


class NoteRepository(BaseRepository[Note]):
    model = Note

    def all_ordered(self) -> List[Note]:
        stmt = select(Note).order_by(Note.updated_at.desc())
        return list(self.session.scalars(stmt).all())

    def recent(self, limit: int = 5) -> List[Note]:
        stmt = select(Note).order_by(Note.updated_at.desc()).limit(limit)
        return list(self.session.scalars(stmt).all())
