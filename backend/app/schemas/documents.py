"""Document schemas."""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import DateTimeStr, ORMModel

AnalyzeTask = Literal[
    "summary",
    "key_points",
    "entities",
    "timeline",
    "executive_summary",
    "qa",
]


class DocumentItem(ORMModel):
    id: int
    name: str
    type: str
    size: int
    pages: Optional[int] = None
    created_at: DateTimeStr


class DocumentDetail(DocumentItem):
    extracted_text: str = ""
    chunk_count: int = 0
    updated_at: DateTimeStr


class DocumentUploadResponse(ORMModel):
    id: int
    name: str
    type: str
    size: int
    pages: Optional[int] = None
    created_at: DateTimeStr


class AnalyzeRequest(BaseModel):
    task: AnalyzeTask
    question: Optional[str] = None


class AnalyzeResponse(BaseModel):
    task: str
    result: str


class CompareRequest(BaseModel):
    ids: List[int] = Field(..., min_length=2)


class CompareResponse(BaseModel):
    result: str
