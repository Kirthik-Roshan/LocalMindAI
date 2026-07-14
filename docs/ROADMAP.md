# Roadmap

LocalMind AI is committed to staying **100% on-device**. Everything on this roadmap preserves the privacy-first, offline-first promise.

---

## ✅ v1.0 — Shipped

- Ten-module desktop-style workspace (Dashboard, AI Workspace, Documents, Images, Voice, Knowledge, Search, Automation, Exports, Settings)
- Ollama-powered generation, chat, and embeddings
- Document upload → extract → auto-index → analyze / compare
- ChromaDB semantic search + cited RAG answers
- Local OCR, image description, captioning, chart reading
- Local voice transcription + command intent
- Multi-format exports (PDF/DOCX/MD/TXT/JSON/CSV)
- Live system stats + Ollama status
- Graceful degradation when Ollama or optional deps are unavailable
- Command palette (⌘K) unified search

---

## 🔜 v1.1 — Streaming & model management

- Token-by-token streaming responses in the UI (using Ollama streaming)
- In-app model manager: browse, pull, and delete models with progress
- Quantization / model-size picker
- Per-module model overrides

---

## 🔭 v1.2 — Richer multimodal

- Integrate vision models (e.g. `llava`) for true image reasoning
- PDF page-level citations with visual highlights
- Table and chart extraction to structured data
- Audio diarization (speaker labels) for meeting transcripts

---

## 🧠 v1.3 — Knowledge & memory

- Persistent per-workspace memory
- Collections / folders for documents
- Re-ranking of retrieved chunks
- Scheduled re-indexing and incremental indexing

---

## 🔐 v1.4 — Security & multi-user

- Optional local authentication
- Encrypted-at-rest document vault
- Role-based access for shared on-prem deployments
- Audit log of AI actions

---

## 🧩 v2.0 — Extensibility

- Plugin system for custom automation tasks
- Local workflow builder (chain transforms + automations)
- Mobile companion app (fully local via Ollama over LAN)
- Community model presets

---

## Guiding principles

1. **Privacy is non-negotiable** — no feature will introduce a cloud dependency.
2. **Offline-first** — every feature must work without a network.
3. **Graceful degradation** — missing models/deps never crash the app.
4. **Premium UX** — it should feel like a shipped product, not a demo.
