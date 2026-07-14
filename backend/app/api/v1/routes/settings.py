"""Settings routes: get + update."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_settings_service
from app.schemas.settings import Settings, SettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=Settings)
def get_settings(service: SettingsService = Depends(get_settings_service)) -> Settings:
    return Settings(**service.get())


@router.put("", response_model=Settings)
def update_settings(
    payload: SettingsUpdate,
    service: SettingsService = Depends(get_settings_service),
) -> Settings:
    updated = service.update(payload.model_dump(exclude_none=True))
    return Settings(**updated)
