"""Ollama model routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_ollama_service
from app.schemas.models import (
    ModelInfo,
    ModelPullRequest,
    ModelPullResponse,
    ModelsResponse,
)
from app.services.ollama_service import OllamaService

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=ModelsResponse)
def list_models(ollama: OllamaService = Depends(get_ollama_service)) -> ModelsResponse:
    raw = ollama.list_models()
    online = ollama.is_online()
    models = [ModelInfo(**m) for m in raw]
    return ModelsResponse(models=models, current=settings.ollama_model, online=online)


@router.post("/pull", response_model=ModelPullResponse)
def pull_model(
    payload: ModelPullRequest, ollama: OllamaService = Depends(get_ollama_service)
) -> ModelPullResponse:
    result = ollama.pull(payload.name)
    return ModelPullResponse(**result)
