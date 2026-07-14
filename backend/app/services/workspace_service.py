"""Workspace service: text transforms + notes CRUD.

Each transform action has a carefully written, task-specific prompt so the
local model produces high-quality, well-structured output.
"""

from __future__ import annotations

from typing import Optional

from app.core.logging import get_logger
from app.db.models import Note
from app.repositories.action_repo import ActionRepository
from app.repositories.note_repo import NoteRepository
from app.schemas.workspace import TransformOptions
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are LocalMind, a precise, professional writing and productivity "
    "assistant running fully offline. Produce clean, well-structured output. "
    "Never add meta commentary like 'Here is the result'. Return only the "
    "requested content."
)


def _build_prompt(text: str, action: str, options: Optional[TransformOptions]) -> str:
    tone = (options.tone if options and options.tone else "professional")
    language = (options.language if options and options.language else "the same language as the input")
    fmt = (options.format if options and options.format else "")

    templates = {
        "rewrite": (
            f"Rewrite the following text to be clearer and more polished while "
            f"preserving its meaning. Use a {tone} tone.\n\n---\n{text}\n---"
        ),
        "expand": (
            "Expand the following text with more detail, examples and depth, "
            "keeping it coherent and on-topic.\n\n---\n" + text + "\n---"
        ),
        "summarize": (
            "Summarize the following text concisely, capturing the key points "
            "in a few sentences.\n\n---\n" + text + "\n---"
        ),
        "translate": (
            f"Translate the following text into {language}. Preserve meaning, "
            f"tone and formatting.\n\n---\n{text}\n---"
        ),
        "improve": (
            "Improve the grammar, clarity, flow and word choice of the following "
            "text. Keep the author's voice.\n\n---\n" + text + "\n---"
        ),
        "report": (
            "Turn the following notes into a structured report with a title, an "
            "executive summary, clearly labeled sections with headings, and a "
            "short conclusion. Use Markdown.\n\n---\n" + text + "\n---"
        ),
        "action_items": (
            "Extract a clear, prioritized list of action items from the following "
            "text. Format each as a Markdown checkbox '- [ ] action' and include "
            "an owner or due date if implied.\n\n---\n" + text + "\n---"
        ),
        "table": (
            "Convert the following information into a well-organized Markdown "
            "table with appropriate column headers.\n\n---\n" + text + "\n---"
        ),
        "email": (
            f"Compose a {tone} email based on the following notes. Include a "
            f"subject line, greeting, well-structured body and sign-off.\n\n---\n{text}\n---"
        ),
        "docs": (
            "Write clear technical documentation from the following content. "
            "Include an overview, usage, and examples where relevant. Use "
            "Markdown headings and code blocks as appropriate.\n\n---\n" + text + "\n---"
        ),
        "minutes": (
            "Produce professional meeting minutes from the following notes. "
            "Include Date/Attendees (if present), Agenda, Discussion, Decisions, "
            "and Action Items sections. Use Markdown.\n\n---\n" + text + "\n---"
        ),
    }

    prompt = templates.get(action)
    if prompt is None:
        prompt = "Process the following text:\n\n---\n" + text + "\n---"
    if fmt:
        prompt += f"\n\nOutput format preference: {fmt}."
    return prompt


class WorkspaceService:
    def __init__(
        self,
        ollama: OllamaService,
        note_repo: NoteRepository,
        action_repo: ActionRepository,
    ) -> None:
        self.ollama = ollama
        self.note_repo = note_repo
        self.action_repo = action_repo

    # -- transforms -----------------------------------------------------------
    def transform(
        self, text: str, action: str, options: Optional[TransformOptions] = None
    ) -> str:
        prompt = _build_prompt(text, action, options)
        result = self.ollama.generate(prompt, system=SYSTEM_PROMPT)
        self.action_repo.log(
            action=f"transform:{action}",
            module="workspace",
            summary=result[:200],
        )
        return result

    # -- notes ----------------------------------------------------------------
    def list_notes(self) -> list[Note]:
        return self.note_repo.all_ordered()

    def create_note(self, title: str, content: str) -> Note:
        note = Note(title=title or "Untitled", content=content or "")
        saved = self.note_repo.add(note)
        self.action_repo.log(action="note_created", module="workspace", summary=saved.title)
        return saved

    def update_note(
        self, note_id: int, title: Optional[str], content: Optional[str]
    ) -> Optional[Note]:
        note = self.note_repo.get(note_id)
        if note is None:
            return None
        if title is not None:
            note.title = title
        if content is not None:
            note.content = content
        return self.note_repo.update(note)

    def delete_note(self, note_id: int) -> bool:
        note = self.note_repo.get(note_id)
        if note is None:
            return False
        self.note_repo.delete(note)
        self.action_repo.log(action="note_deleted", module="workspace", summary=note.title)
        return True
