"""System stats and dashboard schemas."""

from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel

from app.schemas.common import DateTimeStr


class MemoryStats(BaseModel):
    used_gb: float
    total_gb: float
    percent: float


class DiskStats(BaseModel):
    used_gb: float
    total_gb: float
    percent: float


class StorageStats(BaseModel):
    documents: int
    images: int
    exports: int


class OllamaStatus(BaseModel):
    online: bool
    model: str
    version: str


class SystemStats(BaseModel):
    cpu_percent: float
    memory: MemoryStats
    disk: DiskStats
    indexed_files: int
    storage: StorageStats
    ollama: OllamaStatus
    health: Literal["healthy", "degraded", "offline"]


class DashboardStats(BaseModel):
    documents: int
    notes: int
    ai_actions: int
    indexed_chunks: int


class RecentDocument(BaseModel):
    id: int
    name: str
    type: str
    created_at: DateTimeStr


class RecentAction(BaseModel):
    id: int
    action: str
    module: str
    summary: str
    created_at: DateTimeStr


class RecentWorkspace(BaseModel):
    id: int
    title: str
    updated_at: DateTimeStr


class DashboardOverview(BaseModel):
    stats: DashboardStats
    recent_documents: List[RecentDocument]
    recent_actions: List[RecentAction]
    recent_workspaces: List[RecentWorkspace]
