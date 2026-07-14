"""System service: host metrics + application/storage counts + Ollama status."""

from __future__ import annotations

from typing import Dict

from app.core.config import settings
from app.core.logging import get_logger
from app.repositories.document_repo import DocumentRepository
from app.repositories.export_repo import ExportRepository
from app.repositories.image_repo import ImageRepository
from app.repositories.note_repo import NoteRepository
from app.repositories.action_repo import ActionRepository
from app.services.embedding_service import EmbeddingService
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

_GB = 1024 ** 3


class SystemService:
    def __init__(
        self,
        ollama: OllamaService,
        embedding_service: EmbeddingService,
        doc_repo: DocumentRepository,
        note_repo: NoteRepository,
        export_repo: ExportRepository,
        image_repo: ImageRepository,
        action_repo: ActionRepository,
    ) -> None:
        self.ollama = ollama
        self.embedding_service = embedding_service
        self.doc_repo = doc_repo
        self.note_repo = note_repo
        self.export_repo = export_repo
        self.image_repo = image_repo
        self.action_repo = action_repo

    def stats(self) -> Dict[str, object]:
        cpu, memory, disk = self._host_metrics()

        online = self.ollama.is_online()
        version = self.ollama.version() if online else "offline"

        indexed = self.embedding_service.count()
        docs = self.doc_repo.count()
        images = self.image_repo.count()
        exports = self.export_repo.count()

        if online:
            health = "healthy"
        elif docs or self.note_repo.count():
            health = "degraded"
        else:
            health = "offline"

        return {
            "cpu_percent": cpu,
            "memory": memory,
            "disk": disk,
            "indexed_files": docs,
            "storage": {"documents": docs, "images": images, "exports": exports},
            "ollama": {"online": online, "model": settings.ollama_model, "version": version},
            "health": health,
        }

    def dashboard(self) -> Dict[str, object]:
        recent_documents = [
            {
                "id": d.id,
                "name": d.name,
                "type": d.type,
                "created_at": d.created_at,
            }
            for d in self.doc_repo.recent(5)
        ]
        recent_actions = [
            {
                "id": a.id,
                "action": a.action,
                "module": a.module,
                "summary": a.summary,
                "created_at": a.created_at,
            }
            for a in self.action_repo.recent(8)
        ]
        recent_workspaces = [
            {"id": n.id, "title": n.title, "updated_at": n.updated_at}
            for n in self.note_repo.recent(5)
        ]

        stats = {
            "documents": self.doc_repo.count(),
            "notes": self.note_repo.count(),
            "ai_actions": self.action_repo.count(),
            "indexed_chunks": self.embedding_service.count(),
        }

        return {
            "stats": stats,
            "recent_documents": recent_documents,
            "recent_actions": recent_actions,
            "recent_workspaces": recent_workspaces,
        }

    def _host_metrics(self):
        try:
            import psutil  # type: ignore

            cpu = float(psutil.cpu_percent(interval=0.1))
            vm = psutil.virtual_memory()
            memory = {
                "used_gb": round(vm.used / _GB, 2),
                "total_gb": round(vm.total / _GB, 2),
                "percent": float(vm.percent),
            }
            du = psutil.disk_usage("/")
            disk = {
                "used_gb": round(du.used / _GB, 2),
                "total_gb": round(du.total / _GB, 2),
                "percent": float(du.percent),
            }
            return cpu, memory, disk
        except Exception as exc:  # pragma: no cover - psutil should be present
            logger.warning("psutil metrics unavailable: %s", exc)
            zero = {"used_gb": 0.0, "total_gb": 0.0, "percent": 0.0}
            return 0.0, dict(zero), dict(zero)
