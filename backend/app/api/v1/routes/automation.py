"""Automation routes: list tasks + run."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends

from app.core.dependencies import get_automation_service
from app.schemas.automation import (
    AutomationRunRequest,
    AutomationRunResponse,
    AutomationTask,
)
from app.services.automation_service import AutomationService

router = APIRouter(prefix="/automation", tags=["automation"])


@router.get("/tasks", response_model=List[AutomationTask])
def list_tasks(
    service: AutomationService = Depends(get_automation_service),
) -> List[AutomationTask]:
    return [AutomationTask(**t) for t in service.list_tasks()]


@router.post("/run", response_model=AutomationRunResponse)
def run(
    payload: AutomationRunRequest,
    service: AutomationService = Depends(get_automation_service),
) -> AutomationRunResponse:
    result = service.run(payload.task, payload.input, payload.options)
    return AutomationRunResponse(task=payload.task, result=result)
