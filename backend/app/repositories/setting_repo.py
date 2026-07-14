"""Settings key/value repository."""

from __future__ import annotations

from typing import Dict, Optional

from sqlalchemy import select

from app.db.models import Setting
from app.repositories.base import BaseRepository


class SettingRepository(BaseRepository[Setting]):
    model = Setting

    def get_value(self, key: str) -> Optional[str]:
        stmt = select(Setting).where(Setting.key == key)
        row = self.session.scalars(stmt).first()
        return row.value if row else None

    def all_as_dict(self) -> Dict[str, str]:
        return {row.key: row.value for row in self.session.scalars(select(Setting)).all()}

    def set_value(self, key: str, value: str) -> Setting:
        stmt = select(Setting).where(Setting.key == key)
        row = self.session.scalars(stmt).first()
        if row is None:
            row = Setting(key=key, value=value)
        else:
            row.value = value
        return self.update(row)
