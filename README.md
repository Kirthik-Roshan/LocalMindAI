<img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-37" src="https://github.com/user-attachments/assets/fed65970-6056-45eb-9498-ef28038eed52" /><img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-37" src="https://github.com/user-attachments/assets/038fa7e9-16b7-449b-84fc-e5fb1f079ef6" /><img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-37" src="https://github.com/user-attachments/assets/2dc99d59-3e00-4b14-828a-4b95d3a7ee8d" /><div align="center">

# 🧠 LocalMind AI

### Privacy-First Offline AI Workspace

**A premium desktop-style AI workspace — not a chatbot.**
Every AI feature runs locally on your machine via [Ollama](https://ollama.com). No cloud APIs. No API keys. No telemetry. Fully functional offline.

![License](https://img.shields.io/badge/license-MIT-6366f1)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11-009688?logo=fastapi)
![Ollama](https://img.shields.io/badge/AI-Ollama%20local-7c3aed)
![Offline](https://img.shields.io/badge/works-offline-22d3ee)
![Privacy](https://img.shields.io/badge/privacy-100%25%20on--device-16a34a)

</div>

---

## ✨ What is LocalMind AI?

LocalMind AI is a **full AI productivity workspace** that lives entirely on your own hardware. Think of the ambient polish of Linear, the command-driven speed of Raycast, and the knowledge depth of Notion — but with **every inference running locally** through Ollama.

It is **not** a chat window. It is a multi-module workspace where AI is woven into documents, images, voice, knowledge retrieval, search, and automation. Your data never leaves your device.

> **Why on-device?** Sensitive documents, meeting recordings, and private notes should never be uploaded to a third-party cloud. LocalMind AI gives you GPT-class assistance with zero data exfiltration.

---

## 🖼️ Screenshots

> Screenshots are placeholders until you capture your own. See [`assets/screenshots/`](assets/screenshots/).

# 🖼️ Application Preview

| Dashboard | AI Workspace |
|-----------|--------------|
| <img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-02-39" src="https://github.com/user-attachments/assets/08dd2277-4b08-4f16-b91b-43310d1173b0" />|<img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-02-47" src="https://github.com/user-attachments/assets/0b7e0508-3b48-4c2d-8158-32c5300a8a8c" />

| Document Intelligence | Knowledge Base |
|----------------------|----------------|
| <img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-02-53" src="https://github.com/user-attachments/assets/775c4f98-68e0-4d05-b4d5-ec2585152a83" />
 | <img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-13" src="https://github.com/user-attachments/assets/b2807e9c-c9c2-4665-ba43-963c1a55a74b" />
 |

| Smart Search | Settings |
|-------------|----------|
| <img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-19" src="https://github.com/user-attachments/assets/3c0080dc-1ac9-4791-aca6-5fd6b8e587cc" />
 | <img width="1920" height="1080" alt="Screenshot from 2026-07-15 15-03-37" src="https://github.com/user-attachments/assets/2ee0c6ea-86c5-4b92-bc01-685b664ef143" />
 |
---

## 🧩 Features by Module

| Module | Route | What it does |
| --- | --- | --- |
| **Dashboard** | `/` | Live system stats (CPU, memory, disk), Ollama status, recent documents, notes, and AI actions at a glance. |
| **AI Workspace** | `/workspace` | Transform text locally — rewrite, expand, summarize, translate, improve, generate reports, action items, tables, emails, docs, and meeting minutes. Includes a local notes manager. |
| **Document Intelligence** | `/documents` | Upload PDFs/DOCX/TXT, auto-extract text, auto-index into ChromaDB, then run summary, key points, entities, timeline, executive summary, and Q&A. Compare multiple documents. |
| **Image Analysis** | `/images` | Local OCR, description, captioning, explanation, chart reading, and screenshot understanding. |
| **Voice Assistant** | `/voice` | Transcribe audio locally (faster-whisper) and issue voice commands with intent detection. |
| **Knowledge Base** | `/knowledge` | Semantic search and RAG "ask" across everything you've indexed, with cited sources. |
| **Smart Search** | `/search` | Unified ⌘K search across documents, notes, and modules. |
| **Local Automation** | `/automation` | Run reusable AI tasks (reports, extraction, cleanup) on your own inputs. |
| **Exports** | `/exports` | Export any result to PDF, DOCX, Markdown, TXT, JSON, or CSV — generated locally. |
| **Settings** | `/settings` | Choose models, tune temperature/top-p/max-tokens, pick OCR/speech engines, toggle theme. |

---

## 🔒 Privacy & Offline Statement

- **No cloud calls.** All generation, chat, and embeddings go through your local Ollama server.
- **No API keys.** There is nothing to sign up for.
- **No telemetry.** LocalMind AI does not phone home.
- **Offline-first.** After you pull the models, everything works with your network cable unplugged.
- **Your storage.** Documents, notes, vectors, and exports live in local SQLite / ChromaDB / the filesystem.

---

## 🚀 Quickstart

### 1. Prerequisites

- [Ollama](https://ollama.com/download) installed and running
- Node.js 20+
- Python 3.11+

### 2. Pull the local models

```bash
ollama pull qwen2.5:3b   # default chat / reasoning model
ollama pull all-minilm   # default embedding model
```

### 3. Start the backend (FastAPI, port 8000)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start the frontend (Next.js, port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

> Prefer one command? Use the [`Makefile`](Makefile) or [`scripts/`](scripts/):
> ```bash
> make setup      # install everything
> make models     # pull Ollama models
> make dev-backend  # run API
> make dev-frontend # run UI
> ```

### 5. Docker (optional)

```bash
docker compose up --build
```

This starts Ollama, the backend, and the frontend together. See [`docker/README.md`](docker/README.md).

---

## 🏗️ Tech Stack

**Frontend**
- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS v3 + framer-motion
- zustand (state) + lucide-react (icons)
- clsx + tailwind-merge
- shadcn/ui-**inspired**, fully self-contained components (no Radix, no shadcn CLI)

**Backend**
- FastAPI + Python 3.11 (clean architecture: routes → services → repositories, DI)
- pydantic-settings
- SQLite via SQLAlchemy
- ChromaDB (vector store)
- Ollama (all inference + embeddings)

**Optional heavy deps** (lazily imported, degrade gracefully): faster-whisper, pytesseract, pypdf, python-docx, reportlab, sentence-transformers.

---

## 📚 Documentation

| Doc | Description |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System design + AI pipeline diagram |
| [Installation](docs/INSTALLATION.md) | Full setup guide |
| [Deployment](docs/DEPLOYMENT.md) | Docker & production notes |
| [API Reference](docs/API_REFERENCE.md) | Every endpoint documented |
| [OpenAPI Spec](docs/openapi.yaml) | Machine-readable contract |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Tables & relationships |
| [Developer Guide](docs/DEVELOPER.md) | Contributing & conventions |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | Repo layout |
| [Testing](docs/TESTING.md) | How to test |
| [Roadmap](docs/ROADMAP.md) | What's next |
| [Demo Script](docs/DEMO_SCRIPT.md) | Guided walkthrough |
| [Presentation Outline](docs/PRESENTATION_OUTLINE.md) | Pitch deck outline |
| [Hackathon Pitch](README.hackathon.md) | On-Device AI submission |

---

## 📄 License

[MIT](LICENSE) © 2026 LocalMind AI

<div align="center">
<sub>Built for the On-Device AI hackathon. Runs on your machine, answers to no one but you.</sub>
</div>
