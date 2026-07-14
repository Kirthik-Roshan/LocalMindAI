"""Knowledge base schemas."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: Optional[int] = Field(default=5, ge=1, le=50)


class KnowledgeResult(BaseModel):
    text: str
    score: float
    source: str
    document_id: Optional[int] = None


class KnowledgeSearchResponse(BaseModel):
    results: List[KnowledgeResult]


class KnowledgeAskRequest(BaseModel):
    query: str = Field(..., min_length=1)


class KnowledgeSource(BaseModel):
    source: str
    document_id: Optional[int] = None
    snippet: str


class KnowledgeAskResponse(BaseModel):
    answer: str
    sources: List[KnowledgeSource]
