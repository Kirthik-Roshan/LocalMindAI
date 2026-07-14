"""Image analysis schemas."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel

ImageTask = Literal["ocr", "describe", "caption", "explain", "chart", "screenshot"]


class ImageAnalyzeResponse(BaseModel):
    task: str
    text: Optional[str] = None
    description: Optional[str] = None
    caption: Optional[str] = None
