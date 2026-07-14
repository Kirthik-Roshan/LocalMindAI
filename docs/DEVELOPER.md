# Developer Guide

How to work on LocalMind AI: conventions, contracts, and the golden rules that keep the frontend and backend in sync.

---

## 1. Golden rules

1. **Match the contract exactly.** Import paths, export names, and endpoint shapes are fixed (see [API_REFERENCE.md](API_REFERENCE.md) and the frontend spine below). Do not rename or reshape.
2. **No cloud.** All AI goes through Ollama. Never add an external API call.
3. **Degrade gracefully.** If Ollama is unreachable, return a friendly message; never crash.
4. **Lazy-import heavy deps.** `faster-whisper`, `pytesseract`, `pypdf`, `python-docx`, `reportlab`, `sentence-transformers` are imported inside methods, wrapped in `try/except`.
5. **Strict TypeScript.** No `any` unless justified with a comment.
6. **No business logic in routes.** Routes validate + delegate to services.

---

## 2. Backend conventions

Clean architecture, three layers:

```
routes/        # FastAPI routers — HTTP only, DI, validation
services/      # business logic + AI orchestration
repositories/  # SQLAlchemy persistence
```

- **Dependency injection:** services are provided via FastAPI `Depends`. This makes them mockable in tests.
- **Config:** `pydantic-settings` reads env vars. Never hardcode `OLLAMA_HOST` or paths.
- **Schemas:** pydantic models mirror the HTTP contract; response shapes must match exactly.
- **Errors:** raise `HTTPException(status_code, detail=...)` → serialized as `{detail}`.
- **Ollama client:** a single service wraps `/api/generate`, `/api/chat`, `/api/embeddings`, `/api/tags`. All timeouts and connection errors are caught here.

### Adding a backend endpoint

1. Define pydantic request/response schemas.
2. Add a service method (with graceful degradation).
3. Add a thin route that injects the service.
4. Update `docs/API_REFERENCE.md` and `docs/openapi.yaml`.
5. Add tests.

---

## 3. Frontend spine (owned contracts)

The "spine" owns these exports; pages import them. **Signatures must match exactly.**

- `@/lib/utils` → `cn(...inputs)`
- `@/lib/types` → all response interfaces
- `@/lib/api` → `API_BASE`, `api.*` typed methods (throw on `!res.ok`, friendly offline error)
- `@/store/useAppStore` → sidebar/command/recentActions
- `@/store/useSettingsStore` → persisted settings (localStorage `localmind-settings`)
- `@/hooks/useSystemStats` → polls `getSystemStats` every 5s
- `@/components/ui/*` → self-contained shadcn-inspired kit (no Radix)
- `@/components/layout/*` → Sidebar, Topbar, AppShell
- `@/components/shared/*` → PageHeader, GlassCard, CommandPalette, EmptyState, StatusPill, LoadingDots
- `app/layout.tsx` → root layout with `AppShell`

Path alias: `@/*` → `./src/*`.

### Adding a page

1. Create `app/<route>/page.tsx`.
2. Use `PageHeader` + `Card`/`GlassCard`.
3. Call real `api.*` methods with loading / empty / error states.
4. Animate with framer-motion; use lucide icons.

---

## 4. Design language

Dark, premium, glassmorphism (Cursor/Raycast/Linear/Notion/Arc vibe). CSS variables in `globals.css`, mapped in `tailwind.config.ts`. Gradient tokens: violet `#7c3aed` → indigo `#6366f1` → cyan `#22d3ee`. Use the `.glass` utility, rounded-2xl cards, generous spacing.

---

## 5. Local dev workflow

```bash
make setup          # install deps
make models         # pull qwen2.5:3b + all-minilm
make dev-backend    # terminal 1
make dev-frontend   # terminal 2
```

Backend docs: http://localhost:8000/docs
Frontend: http://localhost:3000

---

## 6. Commit & PR conventions

- Small, focused commits with imperative messages ("Add document compare service").
- Keep the contract docs (`API_REFERENCE.md`, `openapi.yaml`) updated with any endpoint change.
- Run `pytest` and `npm run build` before opening a PR.
- CI must be green (see [TESTING.md](TESTING.md)).

---

## 7. Folder map

See [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for the full tree.
