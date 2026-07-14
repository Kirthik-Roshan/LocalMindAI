# Demo Script

A guided ~4-minute walkthrough for showing LocalMind AI live. The goal: prove it is a **full workspace** (not a chatbot) and that **everything runs on-device**.

---

## Pre-demo checklist (do before you present)

- [ ] Ollama running; models pulled: `ollama pull qwen2.5:3b` and `ollama pull all-minilm`
- [ ] Backend up: `make dev-backend` → `curl http://localhost:8000/health` returns ok
- [ ] Frontend up: `make dev-frontend` → http://localhost:3000 loads
- [ ] Have a sample PDF ready to upload (a report or article)
- [ ] Have a short audio clip ready (optional, for voice)
- [ ] Zoom your browser to ~110% for visibility

---

## The script

### 0:00 — Hook (15s)
> "This is LocalMind AI. It looks like a premium AI product — but there's no cloud, no API key, no account. Every bit of AI runs on this laptop through Ollama. Watch."

Open the **Dashboard**. Point at the **green Ollama status pill** and the **live CPU / memory / disk** stats.

> "These stats are real and local. The AI engine is running right here."

### 0:30 — AI Workspace (45s)
Go to **AI Workspace**. Paste rough meeting notes into the editor.

- Click **Summarize** → concise summary appears.
- Click **Meeting Minutes** → structured minutes appear.
- Click **Action Items** → a checklist appears.

> "One input, many local transforms — rewrite, translate, report, table, email, minutes. No text ever left the machine."

### 1:15 — Document Intelligence (60s)
Go to **Document Intelligence**. Upload the sample PDF.

> "On upload, it extracts the text and auto-indexes it into a local vector database."

- Run **Executive Summary** → summary appears.
- Run **Key Points** and **Entities**.
- (If you have two docs) run **Compare**.

### 2:15 — Knowledge Base / RAG (45s)
Go to **Knowledge Base**. Ask a question about the uploaded document.

> "This is retrieval-augmented generation — fully local. It embeds the question, searches the vector store, and grounds the answer in your own files."

Point at the **cited sources** under the answer.

### 3:00 — Smart Search + Command Palette (20s)
Press **⌘K**. Type a keyword.

> "Unified search across documents, notes, and modules — the Raycast-style command palette."

### 3:20 — Exports (20s)
Take the Knowledge answer and go to **Exports**. Export to **PDF**.

> "Generate a shareable PDF, DOCX, or Markdown — rendered locally."

### 3:40 — The money shot: go offline (20s)
Turn on airplane mode / unplug the network. Return to **AI Workspace** and run a transform again.

> "Network's off. It still works. That's the whole point — private, offline, on-device AI."

### 4:00 — Close (10s)
> "LocalMind AI: GPT-class productivity that answers only to you. Thank you."

---

## Backup talking points (if something fails)

- If a model is missing: `ollama pull qwen2.5:3b` live — it's fast.
- If Ollama is down: show the **graceful degradation** — the app gives a friendly message and never crashes. That resilience is a feature.
- If upload parsing fails on an exotic file: use the pre-tested sample PDF.

---

## What to emphasize

1. **Not a chatbot** — ten purpose-built modules.
2. **Truly offline** — the airplane-mode moment.
3. **Cited RAG** — grounded in the user's own data.
4. **Premium, shipped-feeling UX.**
