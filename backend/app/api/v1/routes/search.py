"""Smart search route."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_search_service
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
def search(
    payload: SearchRequest,
    service: SearchService = Depends(get_search_service),
) -> SearchResponse:
    results = service.search(payload.query, payload.types)
    return SearchResponse(results=[SearchResult(**r) for r in results])
