"""Aggregate API v1 router."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.api.v1.routes import (
    automation,
    dashboard,
    documents,
    exports,
    images,
    knowledge,
    models,
    search,
    settings as settings_route,
    system,
    voice,
    workspace,
)

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "version": settings.version}


api_router.include_router(system.router)
api_router.include_router(dashboard.router)
api_router.include_router(models.router)
api_router.include_router(workspace.router)
api_router.include_router(documents.router)
api_router.include_router(images.router)
api_router.include_router(voice.router)
api_router.include_router(knowledge.router)
api_router.include_router(search.router)
api_router.include_router(automation.router)
api_router.include_router(exports.router)
api_router.include_router(settings_route.router)
