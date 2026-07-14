"""System stats routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_system_service
from app.schemas.system import SystemStats
from app.services.system_service import SystemService

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/stats", response_model=SystemStats)
def get_system_stats(service: SystemService = Depends(get_system_service)) -> SystemStats:
    return SystemStats(**service.stats())
