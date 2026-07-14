# Presentation Outline

A slide-by-slide outline for the LocalMind AI pitch (On-Device AI hackathon). Target length: 5–7 minutes + demo.

---

## Slide 1 — Title
- **LocalMind AI** — Privacy-First Offline AI Workspace
- Tagline: *"GPT-class productivity that answers only to you."*
- Logo, presenter name(s).

## Slide 2 — The Problem
- Cloud AI uploads your data to third parties.
- Requires keys, subscriptions, and a network.
- Blocks compliance-bound teams (legal, medical, finance).
- Useless offline.
- One line: **"Sensitive work can't go to the cloud."**

## Slide 3 — The Solution
- A full AI **workspace** (not a chatbot) that runs **100% on-device** via Ollama.
- Ten modules: Dashboard, AI Workspace, Documents, Images, Voice, Knowledge, Search, Automation, Exports, Settings.
- No cloud. No keys. No telemetry. Works offline.

## Slide 4 — Why On-Device
- Comparison table: Cloud AI vs LocalMind AI (privacy, cost, availability, compliance, lock-in).
- Emphasize: the only architecture that satisfies all four at once.

## Slide 5 — Live Demo
- Cut to the app (see [DEMO_SCRIPT.md](DEMO_SCRIPT.md)).
- Highlight the **airplane-mode moment**.

## Slide 6 — Architecture
- The AI pipeline diagram: User Action → FastAPI → Ollama → Embedding → Vector Search → AI Reasoning → Structured Response.
- Stack: Next.js 15 + FastAPI + SQLite + ChromaDB + Ollama.
- Clean architecture (routes → services → repositories) + graceful degradation.

## Slide 7 — What Makes It Special
- Not a chatbot — an opinionated, multi-module product.
- Genuinely offline (no hidden cloud fallback).
- Cited RAG grounded in the user's own files.
- Premium, shipped-feeling UX (glassmorphism, motion, ⌘K palette).
- Resilient: boots and stays friendly even without Ollama or optional deps.

## Slide 8 — Under the Hood (optional / technical judges)
- Ollama HTTP API: `/api/generate`, `/api/chat`, `/api/embeddings`, `/api/tags`.
- Lazy-imported heavy deps (whisper, tesseract, pypdf, docx, reportlab).
- Local storage: SQLite + ChromaDB + filesystem.

## Slide 9 — Roadmap
- Streaming responses, in-app model manager.
- Vision models, page-level citations.
- Encrypted vault, multi-user, plugin system.
- (See [ROADMAP.md](ROADMAP.md).)

## Slide 10 — Close
- Recap the one-liner.
- Call to action: try it — `ollama pull qwen2.5:3b`, then `make dev`.
- Thank you + Q&A.

---

## Delivery tips
- Lead with the demo energy; keep slides sparse.
- The airplane-mode moment is your strongest proof — rehearse it.
- Have the comparison table memorized for Q&A.
- If asked "why not just use ChatGPT?": privacy, compliance, offline, cost.
