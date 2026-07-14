"""Automation schemas."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AutomationTask(BaseModel):
    id: str
    name: str
    description: str


class AutomationRunRequest(BaseModel):
    task: str = Field(..., min_length=1)
    input: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class AutomationRunResponse(BaseModel):
    task: str
    result: str
