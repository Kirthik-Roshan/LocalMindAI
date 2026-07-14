"""Image analysis route."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.dependencies import get_image_service
from app.schemas.images import ImageAnalyzeResponse
from app.services.image_service import ImageService

router = APIRouter(prefix="/images", tags=["images"])

_VALID_TASKS = {"ocr", "describe", "caption", "explain", "chart", "screenshot"}


@router.post("/analyze", response_model=ImageAnalyzeResponse)
async def analyze_image(
    file: UploadFile = File(...),
    task: str = Form("describe"),
    service: ImageService = Depends(get_image_service),
) -> ImageAnalyzeResponse:
    if task not in _VALID_TASKS:
        raise HTTPException(status_code=422, detail=f"Invalid task '{task}'")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    result = service.analyze(file.filename or "image", data, task)
    return ImageAnalyzeResponse(**result)
