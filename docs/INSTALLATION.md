# Installation

This guide gets LocalMind AI running locally. Everything runs on your machine — no cloud accounts, no API keys.

---

## 1. Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| [Ollama](https://ollama.com/download) | latest | The local AI engine. Must be running. |
| Node.js | 20+ | For the Next.js frontend. |
| Python | 3.11+ | For the FastAPI backend. |
| Git | any | To clone the repo. |

Optional system packages for full feature coverage:

- **Tesseract OCR** (for image OCR): `brew install tesseract` / `apt-get install tesseract-ocr`
- **ffmpeg** (helps audio decoding for transcription): `brew install ffmpeg` / `apt-get install ffmpeg`

> These are optional. If missing, the related features return a friendly message and the rest of the app works normally.

---

## 2. Install and start Ollama

1. Download and install Ollama from https://ollama.com/download.
2. Ensure the server is running (it listens on `http://localhost:11434`).
3. Pull the default models:

```bash
ollama pull qwen2.5:3b   # default chat / reasoning model
ollama pull all-minilm   # default embedding model
```

Verify:

```bash
ollama list
curl http://localhost:11434/api/tags
```

---

## 3. Clone the repository

```bash
git clone <your-fork-url> localmind-ai
cd localmind-ai
cp .env.example .env
```

---

## 4. Backend (FastAPI, port 8000)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Check it:

```bash
curl http://localhost:8000/health
# -> {"status":"ok","service":"localmind","version":"..."}
```

Interactive API docs: http://localhost:8000/docs

---

## 5. Frontend (Next.js, port 3000)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

The frontend reads the backend URL from `NEXT_PUBLIC_API_BASE` (default `http://localhost:8000`).

---

## 6. One-command helpers

From the repo root:

```bash
make setup        # install backend + frontend deps
make models       # pull the Ollama models
make dev-backend  # run the API
make dev-frontend # run the UI
```

Or use the scripts directly:

```bash
./scripts/setup.sh
./scripts/pull-models.sh
./scripts/start-backend.sh
./scripts/start-frontend.sh
```

---

## 7. Docker (optional)

Run the whole stack (Ollama + backend + frontend) with Docker:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Ollama: http://localhost:11434

After the containers are up, pull models inside the Ollama container:

```bash
docker exec -it localmind-ollama ollama pull qwen2.5:3b
docker exec -it localmind-ollama ollama pull all-minilm
```

See [docker/README.md](../docker/README.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| UI shows "backend offline" | Make sure the backend is running on port 8000 and `NEXT_PUBLIC_API_BASE` matches. |
| System stats show Ollama offline | Start Ollama; confirm `curl http://localhost:11434/api/tags` works. |
| Model not found errors | Run `ollama pull qwen2.5:3b` and `ollama pull all-minilm`. |
| OCR / voice feature returns a "not available" message | Install Tesseract / ffmpeg and the optional Python deps, then restart the backend. |
| Port already in use | Change `BACKEND_PORT` / frontend port, and update `NEXT_PUBLIC_API_BASE` accordingly. |
