"""Document routes: upload, list, detail, analyze, compare, delete."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.dependencies import get_document_service
from app.schemas.common import DeletedResponse
from app.schemas.documents import (
    AnalyzeRequest,
    AnalyzeResponse,
    CompareRequest,
    CompareResponse,
    DocumentDetail,
    DocumentItem,
    DocumentUploadResponse,
)
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
) -> DocumentUploadResponse:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    document = service.upload(file.filename or "document", data)
    return DocumentUploadResponse.model_validate(document)


@router.get("", response_model=List[DocumentItem])
def list_documents(
    service: DocumentService = Depends(get_document_service),
) -> List[DocumentItem]:
    return [DocumentItem.model_validate(d) for d in service.list_documents()]


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int, service: DocumentService = Depends(get_document_service)
) -> DocumentDetail:
    document = service.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentDetail.model_validate(document)


@router.delete("/{document_id}", response_model=DeletedResponse)
def delete_document(
    document_id: int, service: DocumentService = Depends(get_document_service)
) -> DeletedResponse:
    if not service.delete_document(document_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return DeletedResponse()


@router.post("/{document_id}/analyze", response_model=AnalyzeResponse)
def analyze_document(
    document_id: int,
    payload: AnalyzeRequest,
    service: DocumentService = Depends(get_document_service),
) -> AnalyzeResponse:
    result = service.analyze(document_id, payload.task, payload.question)
    if result is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return AnalyzeResponse(task=payload.task, result=result)


@router.post("/compare", response_model=CompareResponse)
def compare_documents(
    payload: CompareRequest,
    service: DocumentService = Depends(get_document_service),
) -> CompareResponse:
    result = service.compare(payload.ids)
    return CompareResponse(result=result)
