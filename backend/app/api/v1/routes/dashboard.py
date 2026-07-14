"""Dashboard overview route."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_system_service
from app.schemas.system import DashboardOverview
from app.services.system_service import SystemService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverview)
def get_overview(service: SystemService = Depends(get_system_service)) -> DashboardOverview:
    return DashboardOverview(**service.dashboard())
