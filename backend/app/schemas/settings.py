"""Settings schemas."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Settings(BaseModel):
    model: str
    temperature: float
    top_p: float
    max_tokens: int
    embedding_model: str
    ocr_engine: str
    speech_engine: str
    theme: str
    language: str


class SettingsUpdate(BaseModel):
    model: Optional[str] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    max_tokens: Optional[int] = None
    embedding_model: Optional[str] = None
    ocr_engine: Optional[str] = None
    speech_engine: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
