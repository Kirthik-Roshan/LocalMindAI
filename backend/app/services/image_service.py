"""Image analysis service: OCR + vision reasoning.

PIL and pytesseract are imported lazily. When a dedicated vision model is not
available, the service falls back to OCR text plus Ollama reasoning so every
task still returns something useful.
"""

from __future__ import annotations

import uuid
from pathlib import Path
from typing import Dict, Optional

from app.core.config import settings
from app.core.logging import get_logger
from app.repositories.action_repo import ActionRepository
from app.repositories.image_repo import ImageRepository
from app.db.models import ImageRecord
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are LocalMind's vision reasoning assistant running offline. You are "
    "given text extracted from an image (via OCR) and metadata. Reason carefully "
    "and produce a helpful, accurate response for the requested task."
)


class ImageService:
    def __init__(
        self,
        ollama: OllamaService,
        image_repo: ImageRepository,
        action_repo: ActionRepository,
    ) -> None:
        self.ollama = ollama
        self.image_repo = image_repo
        self.action_repo = action_repo

    def _save(self, filename: str, data: bytes) -> Path:
        safe_name = f"{uuid.uuid4().hex}_{Path(filename).name}"
        dest = Path(settings.uploads_dir) / safe_name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return dest

    def _ocr(self, path: Path) -> str:
        try:
            from PIL import Image  # type: ignore
            import pytesseract  # type: ignore
        except Exception:
            logger.warning("pytesseract/PIL not installed; OCR unavailable")
            return ""
        try:
            with Image.open(path) as img:
                return pytesseract.image_to_string(img).strip()
        except Exception as exc:  # pragma: no cover
            logger.warning("OCR failed: %s", exc)
            return ""

    def analyze(self, filename: str, data: bytes, task: str) -> Dict[str, Optional[str]]:
        path = self._save(filename, data)
        ocr_text = self._ocr(path)

        response: Dict[str, Optional[str]] = {"task": task}

        if task == "ocr":
            text = ocr_text or (
                "No text could be detected in this image. OCR may be unavailable "
                "(install tesseract-ocr) or the image contains no readable text."
            )
            response["text"] = text
            self._record(filename, task, path, text)
            return response

        ocr_context = (
            f"\n\nOCR-extracted text from the image:\n---\n{ocr_text}\n---"
            if ocr_text
            else "\n\nNote: no text could be extracted from the image via OCR."
        )

        task_instructions = {
            "describe": "Provide a detailed description of what this image likely depicts, using the available OCR text and context as evidence.",
            "caption": "Write a single concise, natural caption for this image.",
            "explain": "Explain the content and meaning of this image in clear terms, including any text it contains.",
            "chart": "This image is a chart or graph. Interpret it: describe the chart type, axes, key data points and the main insight it conveys, using the OCR text.",
            "screenshot": "This image is a screenshot. Describe the interface/content shown, summarize the visible text, and note any actionable information.",
        }
        instruction = task_instructions.get(task, task_instructions["describe"])
        prompt = f"{instruction}\nImage file name: {filename}{ocr_context}"

        result = self.ollama.generate(prompt, system=SYSTEM_PROMPT)

        if task == "caption":
            response["caption"] = result
        else:
            response["description"] = result
        if ocr_text:
            response["text"] = ocr_text

        self._record(filename, task, path, result)
        return response

    def _record(self, filename: str, task: str, path: Path, result: str) -> None:
        try:
            self.image_repo.add(
                ImageRecord(name=filename, task=task, path=str(path), result=result[:4000])
            )
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to record image analysis: %s", exc)
        self.action_repo.log(action=f"image:{task}", module="images", summary=filename)
