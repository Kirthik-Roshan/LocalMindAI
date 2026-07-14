"""Export schemas."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import DateTimeStr, ORMModel

ExportFormat = Literal["pdf", "docx", "md", "txt", "json", "csv"]


class ExportCreate(BaseModel):
    format: ExportFormat
    title: Optional[str] = None
    content: str = Field(..., min_length=1)


class ExportItem(ORMModel):
    id: int
    filename: str
    format: str
    download_url: str = ""
    created_at: DateTimeStr
