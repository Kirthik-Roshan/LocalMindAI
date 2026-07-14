"""Settings service: persist user preferences with sensible defaults."""

from __future__ import annotations

from typing import Dict

from app.core.config import settings as app_settings
from app.repositories.setting_repo import SettingRepository

DEFAULTS: Dict[str, str] = {
    "model": app_settings.ollama_model,
    "temperature": str(app_settings.temperature),
    "top_p": str(app_settings.top_p),
    "max_tokens": str(app_settings.max_tokens),
    "embedding_model": app_settings.embedding_model,
    "ocr_engine": app_settings.ocr_engine,
    "speech_engine": app_settings.speech_engine,
    "theme": "dark",
    "language": "en",
}

_FLOAT_KEYS = {"temperature", "top_p"}
_INT_KEYS = {"max_tokens"}


class SettingsService:
    def __init__(self, setting_repo: SettingRepository) -> None:
        self.setting_repo = setting_repo

    def get(self) -> Dict[str, object]:
        stored = self.setting_repo.all_as_dict()
        merged = {**DEFAULTS, **stored}
        return self._typed(merged)

    def update(self, partial: Dict[str, object]) -> Dict[str, object]:
        for key, value in partial.items():
            if value is None or key not in DEFAULTS:
                continue
            self.setting_repo.set_value(key, str(value))
        return self.get()

    def _typed(self, data: Dict[str, str]) -> Dict[str, object]:
        result: Dict[str, object] = {}
        for key, value in data.items():
            if key in _FLOAT_KEYS:
                result[key] = _safe_float(value, float(DEFAULTS[key]))
            elif key in _INT_KEYS:
                result[key] = _safe_int(value, int(DEFAULTS[key]))
            else:
                result[key] = value
        return result


def _safe_float(value: str, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: str, default: int) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default
