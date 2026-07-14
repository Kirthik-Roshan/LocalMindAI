"""Export record repository."""

from __future__ import annotations

from typing import List

from sqlalchemy import select

from app.db.models import ExportRecord
from app.repositories.base import BaseRepository


class ExportRepository(BaseRepository[ExportRecord]):
    model = ExportRecord

    def all_ordered(self) -> List[ExportRecord]:
        stmt = select(ExportRecord).order_by(ExportRecord.created_at.desc())
        return list(self.session.scalars(stmt).all())
