"""Knowledge base routes: search + ask."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_knowledge_service
from app.schemas.knowledge import (
    KnowledgeAskRequest,
    KnowledgeAskResponse,
    KnowledgeResult,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeSource,
)
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.post("/search", response_model=KnowledgeSearchResponse)
def search(
    payload: KnowledgeSearchRequest,
    service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeSearchResponse:
    results = service.search(payload.query, payload.top_k or 5)
    return KnowledgeSearchResponse(results=[KnowledgeResult(**r) for r in results])


@router.post("/ask", response_model=KnowledgeAskResponse)
def ask(
    payload: KnowledgeAskRequest,
    service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeAskResponse:
    result = service.ask(payload.query)
    return KnowledgeAskResponse(
        answer=str(result["answer"]),
        sources=[KnowledgeSource(**s) for s in result["sources"]],
    )
