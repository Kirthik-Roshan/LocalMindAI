"""Voice routes: transcription + command intent."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.dependencies import get_voice_service
from app.schemas.voice import (
    TranscribeResponse,
    VoiceCommandRequest,
    VoiceCommandResponse,
)
from app.services.voice_service import VoiceService

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    service: VoiceService = Depends(get_voice_service),
) -> TranscribeResponse:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded audio is empty")
    text, duration = service.transcribe(file.filename or "audio", data)
    return TranscribeResponse(text=text, duration=duration)


@router.post("/command", response_model=VoiceCommandResponse)
def command(
    payload: VoiceCommandRequest,
    service: VoiceService = Depends(get_voice_service),
) -> VoiceCommandResponse:
    result = service.command(payload.text)
    return VoiceCommandResponse(**result)
