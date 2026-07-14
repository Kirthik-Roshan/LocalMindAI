"""Dependency injection providers.

Stateless / expensive-to-build services (Ollama client, embedding + vector
store) are created once as process-wide singletons. Repository-backed services
are built per request around the request-scoped SQLAlchemy session.
"""

from __future__ import annotations

from functools import lru_cache

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_session
from app.repositories.action_repo import ActionRepository
from app.repositories.document_repo import DocumentRepository
from app.repositories.export_repo import ExportRepository
from app.repositories.image_repo import ImageRepository
from app.repositories.note_repo import NoteRepository
from app.repositories.setting_repo import SettingRepository
from app.services.automation_service import AutomationService
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.export_service import ExportService
from app.services.image_service import ImageService
from app.services.knowledge_service import KnowledgeService
from app.services.ollama_service import OllamaService
from app.services.search_service import SearchService
from app.services.settings_service import SettingsService
from app.services.system_service import SystemService
from app.services.voice_service import VoiceService
from app.services.workspace_service import WorkspaceService


# --- Singletons --------------------------------------------------------------
@lru_cache
def get_ollama_service() -> OllamaService:
    return OllamaService()


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_ollama_service())


# --- Repositories (request-scoped) -------------------------------------------
def get_document_repo(session: Session = Depends(get_session)) -> DocumentRepository:
    return DocumentRepository(session)


def get_note_repo(session: Session = Depends(get_session)) -> NoteRepository:
    return NoteRepository(session)


def get_action_repo(session: Session = Depends(get_session)) -> ActionRepository:
    return ActionRepository(session)


def get_export_repo(session: Session = Depends(get_session)) -> ExportRepository:
    return ExportRepository(session)


def get_setting_repo(session: Session = Depends(get_session)) -> SettingRepository:
    return SettingRepository(session)


def get_image_repo(session: Session = Depends(get_session)) -> ImageRepository:
    return ImageRepository(session)


# --- Services (request-scoped, composed from repos + singletons) -------------
def get_workspace_service(
    note_repo: NoteRepository = Depends(get_note_repo),
    action_repo: ActionRepository = Depends(get_action_repo),
) -> WorkspaceService:
    return WorkspaceService(get_ollama_service(), note_repo, action_repo)


def get_document_service(
    doc_repo: DocumentRepository = Depends(get_document_repo),
    action_repo: ActionRepository = Depends(get_action_repo),
) -> DocumentService:
    return DocumentService(
        doc_repo, get_embedding_service(), get_ollama_service(), action_repo
    )


def get_image_service(
    image_repo: ImageRepository = Depends(get_image_repo),
    action_repo: ActionRepository = Depends(get_action_repo),
) -> ImageService:
    return ImageService(get_ollama_service(), image_repo, action_repo)


def get_voice_service(
    action_repo: ActionRepository = Depends(get_action_repo),
) -> VoiceService:
    return VoiceService(get_ollama_service(), action_repo)


def get_knowledge_service(
    action_repo: ActionRepository = Depends(get_action_repo),
) -> KnowledgeService:
    return KnowledgeService(get_embedding_service(), get_ollama_service(), action_repo)


def get_search_service(
    doc_repo: DocumentRepository = Depends(get_document_repo),
    note_repo: NoteRepository = Depends(get_note_repo),
    export_repo: ExportRepository = Depends(get_export_repo),
) -> SearchService:
    return SearchService(get_embedding_service(), doc_repo, note_repo, export_repo)


def get_automation_service(
    action_repo: ActionRepository = Depends(get_action_repo),
    note_repo: NoteRepository = Depends(get_note_repo),
) -> AutomationService:
    return AutomationService(get_ollama_service(), action_repo, note_repo)


def get_export_service(
    export_repo: ExportRepository = Depends(get_export_repo),
    action_repo: ActionRepository = Depends(get_action_repo),
) -> ExportService:
    return ExportService(export_repo, action_repo)


def get_settings_service(
    setting_repo: SettingRepository = Depends(get_setting_repo),
) -> SettingsService:
    return SettingsService(setting_repo)


def get_system_service(
    doc_repo: DocumentRepository = Depends(get_document_repo),
    note_repo: NoteRepository = Depends(get_note_repo),
    export_repo: ExportRepository = Depends(get_export_repo),
    image_repo: ImageRepository = Depends(get_image_repo),
    action_repo: ActionRepository = Depends(get_action_repo),
) -> SystemService:
    return SystemService(
        get_ollama_service(),
        get_embedding_service(),
        doc_repo,
        note_repo,
        export_repo,
        image_repo,
        action_repo,
    )
