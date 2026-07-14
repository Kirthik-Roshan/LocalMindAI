"""Local automation service: predefined AI-powered task runners."""

from __future__ import annotations

from typing import Dict, List, Optional

from app.core.logging import get_logger
from app.repositories.action_repo import ActionRepository
from app.repositories.note_repo import NoteRepository
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are LocalMind's automation engine running fully offline. Execute the "
    "requested productivity task precisely and return clean, well-structured "
    "output in Markdown. Do not add meta commentary."
)

TASKS: List[Dict[str, str]] = [
    {"id": "report", "name": "Generate Report", "description": "Turn raw notes or data into a structured report."},
    {"id": "meeting_notes", "name": "Meeting Notes", "description": "Convert a transcript into clean meeting notes."},
    {"id": "tasks_from_notes", "name": "Tasks from Notes", "description": "Extract actionable tasks from your notes."},
    {"id": "summarize_folder", "name": "Summarize Content", "description": "Summarize a batch of pasted content."},
    {"id": "rename", "name": "Suggest File Names", "description": "Suggest clear, descriptive file names for content."},
    {"id": "organize", "name": "Organize Content", "description": "Categorize and organize a list of items."},
    {"id": "batch_summarize", "name": "Batch Summarize", "description": "Summarize multiple items separated by blank lines."},
    {"id": "generate_docs", "name": "Generate Documentation", "description": "Produce technical documentation from content."},
]

_PROMPTS = {
    "report": "Turn the following content into a structured report with a title, executive summary, sections and a conclusion:\n\n{input}",
    "meeting_notes": "Convert the following transcript/notes into clean meeting notes with Attendees, Agenda, Discussion, Decisions and Action Items:\n\n{input}",
    "tasks_from_notes": "Extract a prioritized list of actionable tasks from the following notes. Format each as '- [ ] task' with an owner/due date if implied:\n\n{input}",
    "summarize_folder": "Summarize the following content into a concise overview with key highlights:\n\n{input}",
    "rename": "Suggest 5 clear, descriptive, filesystem-safe file names (kebab-case) for the following content. Return a numbered list:\n\n{input}",
    "organize": "Organize and categorize the following items into logical groups with headings. Return Markdown:\n\n{input}",
    "batch_summarize": "For each item below (separated by blank lines), produce a one-line summary. Return a Markdown list mapping each item to its summary:\n\n{input}",
    "generate_docs": "Write clear technical documentation for the following. Include Overview, Usage and Examples sections using Markdown:\n\n{input}",
}


class AutomationService:
    def __init__(
        self,
        ollama: OllamaService,
        action_repo: ActionRepository,
        note_repo: NoteRepository,
    ) -> None:
        self.ollama = ollama
        self.action_repo = action_repo
        self.note_repo = note_repo

    def list_tasks(self) -> List[Dict[str, str]]:
        return TASKS

    def run(self, task: str, input_text: Optional[str] = None, options: Optional[dict] = None) -> str:
        template = _PROMPTS.get(task)
        if template is None:
            return f"Unknown automation task '{task}'. Available tasks: {', '.join(t['id'] for t in TASKS)}."

        content = (input_text or "").strip()
        if not content:
            # For tasks_from_notes, fall back to using all stored notes.
            if task == "tasks_from_notes":
                notes = self.note_repo.all_ordered()
                content = "\n\n".join(f"{n.title}: {n.content}" for n in notes).strip()
            if not content:
                return "No input was provided for this automation task."

        prompt = template.format(input=content[:12000])
        result = self.ollama.generate(prompt, system=SYSTEM_PROMPT)
        self.action_repo.log(action=f"automation:{task}", module="automation", summary=result[:200])
        return result
