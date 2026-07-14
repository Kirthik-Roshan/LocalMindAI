# Deployment

LocalMind AI is designed to run **locally** — on a laptop, a workstation, or an on-prem server. There is no cloud component. This document covers Docker Compose and self-hosted production notes.

---

## 1. Docker Compose (recommended)

The repository ships a `docker-compose.yml` that orchestrates three services:

| Service | Image / Build | Port | Notes |
| --- | --- | --- | --- |
| `ollama` | `ollama/ollama:latest` | 11434 | Local AI engine, persistent volume for models |
| `backend` | build `./backend` | 8000 | FastAPI, `OLLAMA_HOST=http://ollama:11434` |
| `frontend` | build `./frontend` | 3000 | Next.js, `NEXT_PUBLIC_API_BASE=http://localhost:8000` |

Start everything:

```bash
docker compose up --build
```

Pull models into the Ollama container (first run only — they persist in the named volume):

```bash
docker exec -it localmind-ollama ollama pull qwen2.5:3b
docker exec -it localmind-ollama ollama pull all-minilm
```

Stop:

```bash
docker compose down          # keep volumes
docker compose down -v       # also delete volumes (models, db, vectors)
```

### Persistent volumes

| Volume | Contents |
| --- | --- |
| `ollama_data` | Downloaded models |
| `backend_database` | SQLite database |
| `backend_vectorstore` | ChromaDB vectors |
| `backend_uploads` | Uploaded documents/images |
| `backend_exports` | Generated exports |
| `backend_logs` | Backend logs |

---

## 2. GPU acceleration (optional)

To let Ollama use an NVIDIA GPU, install the NVIDIA Container Toolkit on the host and add a device reservation to the `ollama` service:

```yaml
  ollama:
    image: ollama/ollama:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

CPU-only works out of the box with `qwen2.5:3b` (small, fast).

---

## 3. Bare-metal / on-prem production

1. Install Ollama as a system service on the host and pull the models.
2. Run the backend behind a process manager:

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
   ```

   Or use `gunicorn` with uvicorn workers:

   ```bash
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000
   ```

3. Build and serve the frontend:

   ```bash
   cd frontend
   npm ci
   npm run build
   npm run start        # serves on :3000
   ```

4. Put a reverse proxy (nginx / Caddy) in front:
   - `/` → frontend `:3000`
   - `/api` → backend `:8000`
   - Ensure `NEXT_PUBLIC_API_BASE` points at the public backend URL at build time.

Example nginx snippet:

```nginx
server {
    listen 80;
    server_name localmind.local;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 4. Environment configuration

All configuration is via environment variables (see [`.env.example`](../.env.example)):

| Variable | Default | Description |
| --- | --- | --- |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL (`http://ollama:11434` in Docker) |
| `LOCALMIND_CHAT_MODEL` | `qwen2.5:3b` | Default chat/reasoning model |
| `LOCALMIND_EMBEDDING_MODEL` | `all-minilm` | Default embedding model |
| `DATABASE_URL` | `sqlite:///./database/localmind.db` | SQLite location |
| `CHROMA_DIR` | `./vectorstore` | ChromaDB persistent dir |
| `UPLOAD_DIR` / `EXPORT_DIR` / `LOG_DIR` | `./uploads` / `./exports` / `./logs` | Filesystem storage |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:8000` | Backend URL used by the browser |

---

## 5. Backups

Because all state is local, backing up is simple — snapshot these paths (or their Docker volumes):

- `database/` (SQLite)
- `vectorstore/` (ChromaDB)
- `uploads/` and `exports/`

---

## 6. Security notes

- LocalMind AI has no authentication layer by default — it is intended for **single-user, local** use. If exposing on a LAN, put it behind an authenticating reverse proxy.
- CORS is restricted to `CORS_ORIGIN`.
- No secrets or API keys are stored because no external services are used.
