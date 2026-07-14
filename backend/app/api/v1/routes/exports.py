"""Export routes: create, list, download."""

from __future__ import annotations

import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.dependencies import get_export_service
from app.schemas.exports import ExportCreate, ExportItem
from app.services.export_service import ExportService

router = APIRouter(prefix="/exports", tags=["exports"])

_MEDIA_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "md": "text/markdown",
    "txt": "text/plain",
    "json": "application/json",
    "csv": "text/csv",
}


def _to_item(record) -> ExportItem:
    item = ExportItem.model_validate(record)
    item.download_url = f"/api/v1/exports/{record.id}/download"
    return item


@router.post("", response_model=ExportItem)
def create_export(
    payload: ExportCreate, service: ExportService = Depends(get_export_service)
) -> ExportItem:
    record = service.create(payload.format, payload.content, payload.title)
    return _to_item(record)


@router.get("", response_model=List[ExportItem])
def list_exports(service: ExportService = Depends(get_export_service)) -> List[ExportItem]:
    return [_to_item(r) for r in service.list_exports()]


@router.get("/{export_id}/download")
def download_export(
    export_id: int, service: ExportService = Depends(get_export_service)
) -> FileResponse:
    record = service.get(export_id)
    if record is None or not os.path.exists(record.path):
        raise HTTPException(status_code=404, detail="Export not found")
    media_type = _MEDIA_TYPES.get(record.format, "application/octet-stream")
    return FileResponse(record.path, media_type=media_type, filename=record.filename)
