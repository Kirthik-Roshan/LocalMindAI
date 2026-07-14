"""Action log repository."""

from __future__ import annotations

from typing import List

from sqlalchemy import select

from app.db.models import ActionLog
from app.repositories.base import BaseRepository


class ActionRepository(BaseRepository[ActionLog]):
    model = ActionLog

    def log(self, action: str, module: str, summary: str = "") -> ActionLog:
        entry = ActionLog(action=action, module=module, summary=summary[:2000])
        return self.add(entry)

    def recent(self, limit: int = 8) -> List[ActionLog]:
        stmt = select(ActionLog).order_by(ActionLog.created_at.desc()).limit(limit)
        return list(self.session.scalars(stmt).all())
