# API Reference

- **Base URL:** `http://localhost:8000`
- **API prefix:** `/api/v1`
- **Content type:** `application/json` (unless multipart is noted)
- **CORS:** allows `http://localhost:3000`
- **Errors:** all errors return `{ "detail": string }` with an appropriate HTTP status code.

A machine-readable OpenAPI 3.1 spec is available at [`openapi.yaml`](openapi.yaml), and live interactive docs at `http://localhost:8000/docs`.

---

## Health

### `GET /health`
### `GET /api/v1/health`

Returns service health.

**Response 200**
```json
{ "status": "ok", "service": "localmind", "version": "1.0.0" }
```

---

## System

### `GET /api/v1/system/stats`

Live system + Ollama status. Polled by the dashboard every 5s.

**Response 200**
```json
{
  "cpu_percent": 23.4,
  "memory": { "used_gb": 8.1, "total_gb": 16.0, "percent": 50.6 },
  "disk": { "used_gb": 210.5, "total_gb": 512.0, "percent": 41.1 },
  "indexed_files": 12,
  "storage": { "documents": 12, "images": 4, "exports": 7 },
  "ollama": { "online": true, "model": "qwen2.5:3b", "version": "0.1.0" },
  "health": "healthy"
}
```

`health` is one of `"healthy" | "degraded" | "offline"`.

---

## Dashboard

### `GET /api/v1/dashboard/overview`

Aggregated data for the dashboard.

**Response 200**
```json
{
  "stats": { "documents": 12, "notes": 5, "ai_actions": 42, "indexed_chunks": 318 },
  "recent_documents": [
    { "id": 1, "name": "report.pdf", "type": "pdf", "created_at": "2026-07-14T10:00:00Z" }
  ],
  "recent_actions": [
    { "id": 1, "action": "summarize", "module": "workspace", "summary": "Summarized notes", "created_at": "2026-07-14T10:05:00Z" }
  ],
  "recent_workspaces": [
    { "id": 1, "title": "Q3 planning", "updated_at": "2026-07-14T09:00:00Z" }
  ]
}
```

---

## Models

### `GET /api/v1/models`

List locally available Ollama models.

**Response 200**
```json
{
  "models": [ { "name": "qwen2.5:3b", "size": "1.9GB", "modified": "2026-07-01T00:00:00Z" } ],
  "current": "qwen2.5:3b",
  "online": true
}
```

### `POST /api/v1/models/pull`

Best-effort pull of a model. May return a queued status.

**Body**
```json
{ "name": "llama3.2:3b" }
```

**Response 200**
```json
{ "status": "queued", "name": "llama3.2:3b" }
```

---

## AI Workspace

### `POST /api/v1/workspace/transform`

Transform text locally via Ollama.

**Body**
```json
{
  "text": "raw text to transform",
  "action": "summarize",
  "options": { "tone": "professional", "language": "en", "format": "markdown" }
}
```

`action` is one of:
`rewrite | expand | summarize | translate | improve | report | action_items | table | email | docs | minutes`.
`options` is optional.

**Response 200**
```json
{ "action": "summarize", "result": "..." }
```

### Notes

#### `GET /api/v1/workspace/notes`
Returns an array of notes.
```json
[ { "id": 1, "title": "Note", "content": "...", "created_at": "...", "updated_at": "..." } ]
```

#### `POST /api/v1/workspace/notes`
**Body:** `{ "title": string, "content": string }` → returns the created note.

#### `PUT /api/v1/workspace/notes/{id}`
**Body:** `{ "title"?: string, "content"?: string }` → returns the updated note.

#### `DELETE /api/v1/workspace/notes/{id}`
Returns `{ "deleted": true }`.

---

## Document Intelligence

### `POST /api/v1/documents/upload`

Multipart upload. Form field: **`file`**. The backend extracts text, stores the document, and auto-indexes it into ChromaDB.

**Response 200**
```json
{ "id": 1, "name": "report.pdf", "type": "pdf", "size": 20480, "pages": 4, "created_at": "..." }
```

### `GET /api/v1/documents`
Returns an array of documents.

### `GET /api/v1/documents/{id}`
Returns a single document including `extracted_text`.

### `DELETE /api/v1/documents/{id}`
Returns `{ "deleted": true }`.

### `POST /api/v1/documents/{id}/analyze`

**Body**
```json
{ "task": "summary", "question": "optional, required for qa" }
```
`task` is one of `summary | key_points | entities | timeline | executive_summary | qa`.

**Response 200**
```json
{ "task": "summary", "result": "..." }
```

### `POST /api/v1/documents/compare`

**Body:** `{ "ids": [1, 2] }`

**Response 200:** `{ "result": "..." }`

---

## Image Analysis

### `POST /api/v1/images/analyze`

Multipart. Form fields: **`file`** (image) and **`task`**.
`task` is one of `ocr | describe | caption | explain | chart | screenshot`.

**Response 200** (fields present depend on task)
```json
{ "task": "ocr", "text": "...", "description": "...", "caption": "..." }
```

---

## Voice Assistant

### `POST /api/v1/voice/transcribe`

Multipart. Form field: **`file`** (audio). Transcribes locally.

**Response 200**
```json
{ "text": "transcribed text", "duration": 12.5 }
```

### `POST /api/v1/voice/command`

**Body:** `{ "text": "open documents" }`

**Response 200**
```json
{ "intent": "navigate", "response": "Opening Document Intelligence" }
```

---

## Knowledge Base

### `POST /api/v1/knowledge/search`

Semantic search over indexed chunks.

**Body:** `{ "query": "...", "top_k": 5 }` (`top_k` optional)

**Response 200**
```json
{
  "results": [
    { "text": "...", "score": 0.82, "source": "report.pdf", "document_id": 1 }
  ]
}
```

### `POST /api/v1/knowledge/ask`

RAG answer with cited sources.

**Body:** `{ "query": "..." }`

**Response 200**
```json
{
  "answer": "...",
  "sources": [ { "source": "report.pdf", "document_id": 1, "snippet": "..." } ]
}
```

---

## Smart Search

### `POST /api/v1/search`

Unified search across modules.

**Body:** `{ "query": "...", "types": ["document", "note"] }` (`types` optional)

**Response 200**
```json
{
  "results": [
    { "type": "document", "title": "report.pdf", "snippet": "...", "score": 0.9, "id": 1, "module": "documents" }
  ]
}
```

---

## Local Automation

### `GET /api/v1/automation/tasks`
Returns available automation tasks.
```json
[ { "id": "cleanup", "name": "Cleanup text", "description": "..." } ]
```

### `POST /api/v1/automation/run`

**Body**
```json
{ "task": "cleanup", "input": "...", "options": {} }
```

**Response 200:** `{ "task": "cleanup", "result": "..." }`

---

## Exports

### `POST /api/v1/exports`

Generate an export file locally.

**Body**
```json
{ "format": "pdf", "title": "My Report", "content": "..." }
```
`format` is one of `pdf | docx | md | txt | json | csv`. `title` optional.

**Response 200**
```json
{
  "id": 1,
  "filename": "my-report.pdf",
  "format": "pdf",
  "download_url": "/api/v1/exports/1/download",
  "created_at": "..."
}
```

### `GET /api/v1/exports`
Returns an array of export records.

### `GET /api/v1/exports/{id}/download`
Streams the export file.

---

## Settings

### `GET /api/v1/settings`

**Response 200**
```json
{
  "model": "qwen2.5:3b",
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 2048,
  "embedding_model": "all-minilm",
  "ocr_engine": "tesseract",
  "speech_engine": "whisper",
  "theme": "dark",
  "language": "en"
}
```

### `PUT /api/v1/settings`

**Body:** a partial settings object. Returns the full updated settings.

---

## Error format

All endpoints return errors as:

```json
{ "detail": "Human-friendly error message." }
```

When Ollama is unreachable, AI endpoints return **200** with a friendly explanatory `result`/`answer` string (graceful degradation) rather than a hard failure, so the UI stays usable offline.
