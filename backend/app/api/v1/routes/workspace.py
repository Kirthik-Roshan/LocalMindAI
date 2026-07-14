"""Workspace routes: transform + notes CRUD."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_workspace_service
from app.schemas.common import DeletedResponse
from app.schemas.workspace import (
    NoteCreate,
    NoteOut,
    NoteUpdate,
    TransformRequest,
    TransformResponse,
)
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspace", tags=["workspace"])


@router.post("/transform", response_model=TransformResponse)
def transform(
    payload: TransformRequest,
    service: WorkspaceService = Depends(get_workspace_service),
) -> TransformResponse:
    result = service.transform(payload.text, payload.action, payload.options)
    return TransformResponse(action=payload.action, result=result)


@router.get("/notes", response_model=List[NoteOut])
def list_notes(service: WorkspaceService = Depends(get_workspace_service)) -> List[NoteOut]:
    return [NoteOut.model_validate(n) for n in service.list_notes()]


@router.post("/notes", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate, service: WorkspaceService = Depends(get_workspace_service)
) -> NoteOut:
    note = service.create_note(payload.title, payload.content)
    return NoteOut.model_validate(note)


@router.put("/notes/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    service: WorkspaceService = Depends(get_workspace_service),
) -> NoteOut:
    note = service.update_note(note_id, payload.title, payload.content)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteOut.model_validate(note)


@router.delete("/notes/{note_id}", response_model=DeletedResponse)
def delete_note(
    note_id: int, service: WorkspaceService = Depends(get_workspace_service)
) -> DeletedResponse:
    if not service.delete_note(note_id):
        raise HTTPException(status_code=404, detail="Note not found")
    return DeletedResponse()
