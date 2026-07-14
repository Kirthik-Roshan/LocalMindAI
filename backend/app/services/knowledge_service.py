"""Knowledge base service: semantic search + retrieval-augmented answering."""

from __future__ import annotations

from typing import Dict, List

from app.core.logging import get_logger
from app.repositories.action_repo import ActionRepository
from app.services.embedding_service import EmbeddingService
from app.services.ollama_service import OllamaService

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are LocalMind's knowledge assistant running fully offline. Answer the "
    "question using ONLY the provided context passages. Cite sources by their "
    "name where helpful. If the context is insufficient, clearly say you don't "
    "have enough information in the knowledge base."
)


class KnowledgeService:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        ollama: OllamaService,
        action_repo: ActionRepository,
    ) -> None:
        self.embedding_service = embedding_service
        self.ollama = ollama
        self.action_repo = action_repo

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, object]]:
        results = self.embedding_service.query(query, top_k=top_k)
        self.action_repo.log(action="knowledge_search", module="knowledge", summary=query[:200])
        return results

    def ask(self, query: str) -> Dict[str, object]:
        chunks = self.embedding_service.query(query, top_k=5)

        if not chunks:
            answer = (
                "I couldn't find anything relevant in your knowledge base. Try "
                "uploading documents first, or make sure the local AI engine is "
                "running so content can be indexed and searched."
            )
            self.action_repo.log(action="knowledge_ask", module="knowledge", summary=query[:200])
            return {"answer": answer, "sources": []}

        context_blocks = []
        sources: List[Dict[str, object]] = []
        for idx, chunk in enumerate(chunks, start=1):
            text = str(chunk.get("text", ""))
            source = str(chunk.get("source", "document"))
            context_blocks.append(f"[{idx}] Source: {source}\n{text}")
            sources.append(
                {
                    "source": source,
                    "document_id": chunk.get("document_id"),
                    "snippet": text[:280],
                }
            )

        prompt = (
            f"Question: {query}\n\nContext passages:\n"
            + "\n\n".join(context_blocks)
            + "\n\nAnswer the question based on the context above."
        )
        answer = self.ollama.generate(prompt, system=SYSTEM_PROMPT)
        self.action_repo.log(action="knowledge_ask", module="knowledge", summary=query[:200])
        return {"answer": answer, "sources": sources}
