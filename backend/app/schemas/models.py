"""Ollama model listing schemas."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel


class ModelInfo(BaseModel):
    name: str
    size: str
    modified: str


class ModelsResponse(BaseModel):
    models: List[ModelInfo]
    current: str
    online: bool


class ModelPullRequest(BaseModel):
    name: str


class ModelPullResponse(BaseModel):
    status: str
    name: str
