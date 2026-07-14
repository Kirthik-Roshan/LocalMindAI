"""Shared/base schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict


def _to_iso(value: object) -> object:
    """Coerce datetime values to ISO-8601 strings; pass others through."""
    if isinstance(value, datetime):
        return value.isoformat()
    return value


# A string field that also accepts datetime objects (e.g. from ORM attributes)
# and serializes them to ISO-8601.
DateTimeStr = Annotated[str, BeforeValidator(_to_iso)]


class ORMModel(BaseModel):
    """Base model configured to read from ORM attributes."""

    model_config = ConfigDict(from_attributes=True)


class DeletedResponse(BaseModel):
    deleted: bool = True


class MessageResponse(BaseModel):
    detail: str
