"""Voice assistant schemas."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class TranscribeResponse(BaseModel):
    text: str
    duration: Optional[float] = None


class VoiceCommandRequest(BaseModel):
    text: str


class VoiceCommandResponse(BaseModel):
    intent: str
    response: str
