"""Ollama HTTP client with graceful offline handling.

Every method degrades gracefully: when Ollama is unreachable the generation
methods return a clear, friendly message instead of raising, and the listing
helpers return safe empty defaults. This keeps the whole API responsive even
when no model server is running.
"""

from __future__ import annotations

from typing import Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

OFFLINE_MESSAGE = (
    "The local AI engine (Ollama) is not reachable right now. "
    "Please make sure Ollama is running at {host} and the model "
    "'{model}' is installed (try: `ollama pull {model}`)."
)


class OllamaService:
    """Thin, resilient wrapper around the Ollama REST API."""

    def __init__(
        self,
        host: Optional[str] = None,
        model: Optional[str] = None,
        embedding_model: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        self.host = (host or settings.ollama_host).rstrip("/")
        self.model = model or settings.ollama_model
        self.embedding_model = embedding_model or settings.embedding_model
        self.timeout = timeout or settings.ollama_timeout

    # -- internal helpers -----------------------------------------------------
    def _offline_message(self, model: Optional[str] = None) -> str:
        return OFFLINE_MESSAGE.format(host=self.host, model=model or self.model)

    def _client(self, timeout: Optional[float] = None) -> httpx.Client:
        return httpx.Client(base_url=self.host, timeout=timeout or self.timeout)

    def _options(
        self,
        temperature: Optional[float],
        top_p: Optional[float],
        max_tokens: Optional[int],
    ) -> Dict[str, object]:
        return {
            "temperature": settings.temperature if temperature is None else temperature,
            "top_p": settings.top_p if top_p is None else top_p,
            "num_predict": settings.max_tokens if max_tokens is None else max_tokens,
        }

    # -- health / metadata ----------------------------------------------------
    def is_online(self) -> bool:
        try:
            with self._client(timeout=3.0) as client:
                resp = client.get("/api/tags")
                return resp.status_code == 200
        except httpx.HTTPError:
            return False

    def version(self) -> str:
        try:
            with self._client(timeout=3.0) as client:
                resp = client.get("/api/version")
                resp.raise_for_status()
                return str(resp.json().get("version", "unknown"))
        except httpx.HTTPError:
            return "offline"

    def list_models(self) -> List[Dict[str, object]]:
        try:
            with self._client(timeout=5.0) as client:
                resp = client.get("/api/tags")
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPError:
            logger.warning("Ollama list_models failed; returning empty list")
            return []

        models: List[Dict[str, object]] = []
        for item in data.get("models", []):
            size_bytes = int(item.get("size", 0) or 0)
            models.append(
                {
                    "name": item.get("name", "unknown"),
                    "size": _human_size(size_bytes),
                    "modified": str(item.get("modified_at", "")),
                }
            )
        return models

    # -- generation -----------------------------------------------------------
    def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        payload: Dict[str, object] = {
            "model": model or self.model,
            "prompt": prompt,
            "stream": False,
            "options": self._options(temperature, top_p, max_tokens),
        }
        if system:
            payload["system"] = system

        try:
            with self._client() as client:
                resp = client.post("/api/generate", json=payload)
                resp.raise_for_status()
                data = resp.json()
                return str(data.get("response", "")).strip()
        except httpx.HTTPError as exc:
            logger.warning("Ollama generate failed: %s", exc)
            return self._offline_message(model)

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        payload: Dict[str, object] = {
            "model": model or self.model,
            "messages": messages,
            "stream": False,
            "options": self._options(temperature, top_p, max_tokens),
        }
        try:
            with self._client() as client:
                resp = client.post("/api/chat", json=payload)
                resp.raise_for_status()
                data = resp.json()
                return str(data.get("message", {}).get("content", "")).strip()
        except httpx.HTTPError as exc:
            logger.warning("Ollama chat failed: %s", exc)
            return self._offline_message(model)

    # -- embeddings -----------------------------------------------------------
    def embeddings(self, text: str, model: Optional[str] = None) -> List[float]:
        payload = {"model": model or self.embedding_model, "prompt": text}
        try:
            with self._client() as client:
                resp = client.post("/api/embeddings", json=payload)
                resp.raise_for_status()
                data = resp.json()
                vector = data.get("embedding", [])
                return [float(x) for x in vector]
        except httpx.HTTPError as exc:
            logger.warning("Ollama embeddings failed: %s", exc)
            return []

    # -- model management -----------------------------------------------------
    def pull(self, name: str) -> Dict[str, str]:
        """Best-effort model pull. Returns a queued/ok/offline status."""
        try:
            with self._client(timeout=10.0) as client:
                # Non-streaming pull request; Ollama streams progress but we
                # only kick it off and report a queued status to stay snappy.
                resp = client.post("/api/pull", json={"name": name, "stream": False})
                if resp.status_code == 200:
                    return {"status": "ok", "name": name}
                return {"status": "queued", "name": name}
        except httpx.HTTPError:
            return {"status": "offline", "name": name}


def _human_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024.0 or unit == "TB":
            return f"{size:.1f} {unit}" if unit != "B" else f"{int(size)} B"
        size /= 1024.0
    return f"{size:.1f} TB"
