"""Smart search schemas."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    types: Optional[List[str]] = None


class SearchResult(BaseModel):
    type: str
    title: str
    snippet: str
    score: float
    id: int
    module: str


class SearchResponse(BaseModel):
    results: List[SearchResult]
