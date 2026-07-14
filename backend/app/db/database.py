"""SQLAlchemy engine, session factory and initialization for SQLite."""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def _build_engine():
    Path(settings.sqlite_path).parent.mkdir(parents=True, exist_ok=True)
    url = f"sqlite:///{settings.sqlite_path}"
    return create_engine(
        url,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False},
    )


engine = _build_engine()
SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=Session
)


def init_db() -> None:
    """Create all tables. Imports models so they register with ``Base``."""
    # Local import avoids circular import at module load time.
    from app.db import models  # noqa: F401

    Path(settings.sqlite_path).parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized at %s", settings.sqlite_path)


def get_session() -> Iterator[Session]:
    """FastAPI dependency yielding a scoped session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
