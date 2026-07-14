"""Generic repository base implementing common CRUD over SQLAlchemy."""

from __future__ import annotations

from typing import Generic, List, Optional, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable CRUD operations for a single ORM model."""

    model: Type[ModelT]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, obj_id: int) -> Optional[ModelT]:
        return self.session.get(self.model, obj_id)

    def list(self, limit: int | None = None, offset: int = 0) -> List[ModelT]:
        stmt = select(self.model).order_by(self.model.id.desc()).offset(offset)
        if limit is not None:
            stmt = stmt.limit(limit)
        return list(self.session.scalars(stmt).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.commit()

    def count(self) -> int:
        return int(self.session.scalar(select(func.count()).select_from(self.model)) or 0)
