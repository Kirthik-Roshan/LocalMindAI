# Docker Setup

This directory documents the Docker Compose setup for LocalMind AI. The compose file lives at the repository root: [`../docker-compose.yml`](../docker-compose.yml).

Everything still runs **locally** — Docker just packages Ollama, the backend, and the frontend into one reproducible stack.

---

## Services

| Service | Image / Build | Host port | Purpose |
| --- | --- | --- | --- |
| `ollama` | `ollama/ollama:latest` | `11434` | Local AI engine (generation + embeddings). Models persist in the `ollama_data` volume. |
| `backend` | build `../backend` | `8000` | FastAPI API. Talks to Ollama at `http://ollama:11434`. |
| `frontend` | build `../frontend` | `3000` | Next.js UI. Browser reaches the backend at `http://localhost:8000`. |

`backend` `depends_on` `ollama`, and `frontend` `depends_on` `backend`.

---

## Quick start

From the repository root:

```bash
docker compose up --build
```

Then pull the models into the Ollama container (first run only — they persist):

```bash
docker exec -it localmind-ollama ollama pull qwen2.5:3b
docker exec -it localmind-ollama ollama pull all-minilm
```

Open:

- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs
- Ollama: http://localhost:11434

Stop the stack:

```bash
docker compose down        # keep data
docker compose down -v     # also delete volumes (models, db, vectors, uploads, exports)
```

---

## Why `NEXT_PUBLIC_API_BASE=http://localhost:8000`?

`NEXT_PUBLIC_*` variables are baked into the **browser** bundle. The browser runs on the host, so it must reach the backend via the host-mapped port `localhost:8000` — not the internal Docker DNS name `backend`. Meanwhile the backend reaches Ollama over the internal network as `http://ollama:11434`.

---

## Persistent volumes

| Volume | Mounted at | Contents |
| --- | --- | --- |
| `ollama_data` | `/root/.ollama` | Downloaded models |
| `backend_database` | `/app/database` | SQLite database |
| `backend_vectorstore` | `/app/vectorstore` | ChromaDB vectors |
| `backend_uploads` | `/app/uploads` | Uploaded files |
| `backend_exports` | `/app/exports` | Generated exports |
| `backend_logs` | `/app/logs` | Backend logs |

---

## GPU (optional)

To let Ollama use an NVIDIA GPU, install the NVIDIA Container Toolkit on the host and add a device reservation to the `ollama` service (see [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md#2-gpu-acceleration-optional)). CPU-only works fine for the default `qwen2.5:3b`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Frontend can't reach backend | Confirm `NEXT_PUBLIC_API_BASE=http://localhost:8000` and port 8000 is mapped. |
| "model not found" | Run the `ollama pull` commands above inside the `localmind-ollama` container. |
| Backend can't reach Ollama | Ensure `OLLAMA_HOST=http://ollama:11434` (set in compose) and the `ollama` service is healthy. |
| Slow first response | The model loads into memory on first use; subsequent calls are fast. |
