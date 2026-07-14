# Testing

LocalMind AI is tested at two layers: the FastAPI backend (pytest) and the Next.js frontend (type-check + build). Because all AI is local, tests either mock the Ollama client or assert the graceful-degradation path when Ollama is offline.

---

## 1. Backend tests (pytest)

```bash
cd backend
source .venv/bin/activate
pytest -q
```

### What to test

| Area | Focus |
| --- | --- |
| Routes | Correct status codes, response shape matches the contract, validation errors return `{detail}`. |
| Services | Prompt construction, chunking, and orchestration logic with a **mocked Ollama client**. |
| Graceful degradation | When the Ollama client raises / is offline, AI endpoints return a friendly message and never 500. |
| Repositories | CRUD for Documents, Notes, ActionLogs, ExportRecords, Settings, ImageRecords against a temp SQLite DB. |
| Lazy imports | Feature endpoints return a clear "not available" message when an optional dep (pytesseract, faster-whisper, pypdf, python-docx, reportlab) is missing. |

### Recommended fixtures

- A temporary SQLite database per test (`tmp_path`).
- A fake Ollama client injected via FastAPI dependency overrides.
- A temp ChromaDB directory.

### Example: health endpoint

```python
def test_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["service"] == "localmind"
```

### Example: graceful degradation

```python
def test_transform_offline(client, offline_ollama):
    res = client.post("/api/v1/workspace/transform",
                      json={"text": "hi", "action": "summarize"})
    assert res.status_code == 200
    assert "result" in res.json()   # friendly message, not a crash
```

---

## 2. Frontend checks

The frontend is validated by strict TypeScript and a production build:

```bash
cd frontend
npm run build     # fails on type errors or build errors
```

Optional linting:

```bash
npm run lint
```

### What the build guards

- `@/lib/types` matches the backend contract.
- `@/lib/api` methods have correct signatures.
- All page components compile under `strict` TypeScript.

---

## 3. Manual / end-to-end smoke test

With Ollama running and both servers up:

1. Dashboard shows a green Ollama pill and live stats.
2. Upload a document → it appears in the list → run "summary".
3. Ask the Knowledge Base a question → answer + sources.
4. Workspace transform (summarize) returns text.
5. Create and download an export.
6. Stop Ollama → repeat step 4 → app shows a friendly offline message (no crash).

---

## 4. CI

`.github/workflows/ci.yml` runs on every push/PR:

- **backend**: Python 3.11, `pip install`, `ruff` (allowed to fail), `pytest`.
- **frontend**: Node 20, `npm ci || npm i`, `npm run build`.

CI does not require Ollama — tests mock it or exercise the offline path.
