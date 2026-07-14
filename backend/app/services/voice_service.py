"""Voice service: transcription (faster-whisper) + command intent.

faster-whisper is imported lazily. If it is not installed, transcription
returns a clear message instead of crashing.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Dict, Optional, Tuple

from app.core.config import settings
from app.core.logging import get_logger
from app.repositories.action_repo import ActionRepository
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

# Lazily-instantiated singleton whisper model (loading is expensive).
_WHISPER_MODEL = None
_WHISPER_FAILED = False

INTENTS = [
    "create_note",
    "search_documents",
    "summarize",
    "ask_knowledge",
    "run_automation",
    "open_module",
    "unknown",
]


class VoiceService:
    def __init__(self, ollama: OllamaService, action_repo: ActionRepository) -> None:
        self.ollama = ollama
        self.action_repo = action_repo

    def _load_model(self):
        global _WHISPER_MODEL, _WHISPER_FAILED
        if _WHISPER_MODEL is not None or _WHISPER_FAILED:
            return _WHISPER_MODEL
        try:
            from faster_whisper import WhisperModel  # type: ignore

            _WHISPER_MODEL = WhisperModel("base", device="cpu", compute_type="int8")
            logger.info("faster-whisper model loaded")
        except Exception as exc:
            logger.warning("faster-whisper unavailable: %s", exc)
            _WHISPER_FAILED = True
            _WHISPER_MODEL = None
        return _WHISPER_MODEL

    def transcribe(self, filename: str, data: bytes) -> Tuple[str, Optional[float]]:
        model = self._load_model()
        if model is None:
            return (
                "Speech-to-text is not available because 'faster-whisper' is not "
                "installed. Install it to enable offline voice transcription.",
                None,
            )

        safe_name = f"{uuid.uuid4().hex}_{Path(filename).name or 'audio'}"
        dest = Path(settings.uploads_dir) / safe_name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)

        try:
            segments, info = model.transcribe(str(dest), beam_size=5)
            text = " ".join(seg.text.strip() for seg in segments).strip()
            duration = float(getattr(info, "duration", 0.0) or 0.0)
            self.action_repo.log(
                action="voice_transcribe", module="voice", summary=text[:200]
            )
            return text, duration
        except Exception as exc:  # pragma: no cover
            logger.warning("Transcription failed: %s", exc)
            return f"Transcription failed: {exc}", None
        finally:
            try:
                dest.unlink(missing_ok=True)
            except OSError:
                pass

    def command(self, text: str) -> Dict[str, str]:
        prompt = (
            "You are a voice command router for a local AI workspace. Given a "
            "user's spoken request, classify its intent and write a short, helpful "
            "response describing what action would be taken.\n\n"
            f"Available intents: {', '.join(INTENTS)}.\n\n"
            f'User said: "{text}"\n\n'
            'Respond ONLY with strict JSON of the form '
            '{"intent": "<one of the intents>", "response": "<short reply>"}.'
        )
        raw = self.ollama.generate(prompt)
        intent, response = self._parse(raw, text)
        self.action_repo.log(action=f"voice_command:{intent}", module="voice", summary=text[:200])
        return {"intent": intent, "response": response}

    def _parse(self, raw: str, original: str) -> Tuple[str, str]:
        # Attempt to extract JSON from the model output.
        try:
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1 and end > start:
                data = json.loads(raw[start : end + 1])
                intent = str(data.get("intent", "unknown"))
                response = str(data.get("response", "")).strip()
                if intent not in INTENTS:
                    intent = "unknown"
                if not response:
                    response = f"Understood. Interpreting your request: {original}"
                return intent, response
        except (json.JSONDecodeError, ValueError):
            pass
        # Fallback: return the raw text as the response.
        return "unknown", raw.strip() or f"I heard: {original}"
