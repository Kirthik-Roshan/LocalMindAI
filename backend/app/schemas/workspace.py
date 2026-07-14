"""Workspace (transform + notes) schemas."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import DateTimeStr, ORMModel

TransformAction = Literal[
    "rewrite",
    "expand",
    "summarize",
    "translate",
    "improve",
    "report",
    "action_items",
    "table",
    "email",
    "docs",
    "minutes",
]


class TransformOptions(BaseModel):
    tone: Optional[str] = None
    language: Optional[str] = None
    format: Optional[str] = None


class TransformRequest(BaseModel):
    text: str = Field(..., min_length=1)
    action: TransformAction
    options: Optional[TransformOptions] = None


class TransformResponse(BaseModel):
    action: str
    result: str


class NoteCreate(BaseModel):
    title: str = Field(default="Untitled")
    content: str = Field(default="")


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class NoteOut(ORMModel):
    id: int
    title: str
    content: str
    created_at: DateTimeStr
    updated_at: DateTimeStr
