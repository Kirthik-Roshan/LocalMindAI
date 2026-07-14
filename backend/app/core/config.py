"""Application configuration via pydantic-settings.

All values can be overridden through environment variables or a local ``.env``
file. Paths are resolved to absolute locations relative to the backend root so
the server behaves identically regardless of the working directory it is
launched from.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ root (…/backend/app/core/config.py -> parents[2] == backend/)
BACKEND_ROOT = Path(__file__).resolve().parents[2]
DATA_ROOT = BACKEND_ROOT / "data"


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application metadata -------------------------------------------------
    app_name: str = Field(default="localmind", alias="APP_NAME")
    version: str = Field(default="1.0.0", alias="APP_VERSION")

    # --- Ollama ---------------------------------------------------------------
    ollama_host: str = Field(default="http://localhost:11434", alias="OLLAMA_HOST")
    ollama_model: str = Field(default="llama3.2:latest", alias="OLLAMA_MODEL")
    embedding_model: str = Field(default="all-minilm", alias="EMBEDDING_MODEL")
    ollama_timeout: float = Field(default=120.0, alias="OLLAMA_TIMEOUT")

    # --- Storage paths --------------------------------------------------------
    sqlite_path: str = Field(default=str(DATA_ROOT / "localmind.db"), alias="SQLITE_PATH")
    chroma_path: str = Field(default=str(DATA_ROOT / "chroma"), alias="CHROMA_PATH")
    uploads_dir: str = Field(default=str(DATA_ROOT / "uploads"), alias="UPLOADS_DIR")
    exports_dir: str = Field(default=str(DATA_ROOT / "exports"), alias="EXPORTS_DIR")
    logs_dir: str = Field(default=str(BACKEND_ROOT / "logs"), alias="LOGS_DIR")

    # --- CORS -----------------------------------------------------------------
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="CORS_ORIGINS",
    )

    # --- Inference defaults ---------------------------------------------------
    temperature: float = Field(default=0.7, alias="TEMPERATURE")
    top_p: float = Field(default=0.9, alias="TOP_P")
    max_tokens: int = Field(default=2048, alias="MAX_TOKENS")

    # --- Engines --------------------------------------------------------------
    ocr_engine: str = Field(default="tesseract", alias="OCR_ENGINE")
    speech_engine: str = Field(default="whisper", alias="SPEECH_ENGINE")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors(cls, value: object) -> object:
        """Allow CORS origins to be provided as a comma-separated string."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    def ensure_directories(self) -> None:
        """Create every directory the application relies upon."""
        for path in (
            Path(self.sqlite_path).parent,
            Path(self.chroma_path),
            Path(self.uploads_dir),
            Path(self.exports_dir),
            Path(self.logs_dir),
        ):
            path.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()


settings = get_settings()
