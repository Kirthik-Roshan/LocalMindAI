# Folder Structure

The repository is a monorepo with a Python backend, a Next.js frontend, and supporting docs/infra.

```
localmind-ai/
├── README.md                  # Project hero + quickstart
├── README.hackathon.md        # On-Device AI hackathon pitch
├── LICENSE                    # MIT (2026)
├── .gitignore
├── .env.example               # Shared env template
├── docker-compose.yml         # ollama + backend + frontend
├── Makefile                   # setup / dev / up / down / test / models
│
├── backend/                   # FastAPI (clean architecture)
│   ├── app/
│   │   ├── main.py            # App factory, CORS, router mount
│   │   ├── config.py          # pydantic-settings
│   │   ├── routes/            # HTTP layer (one router per module)
│   │   ├── services/          # business logic + AI orchestration
│   │   ├── repositories/      # SQLAlchemy persistence
│   │   ├── schemas/           # pydantic request/response models
│   │   ├── models/            # SQLAlchemy ORM models
│   │   └── ollama_client.py   # wraps /api/generate,/chat,/embeddings,/tags
│   ├── tests/                 # pytest
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                  # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/               # routes (page.tsx per module) + layout.tsx
│   │   ├── components/
│   │   │   ├── ui/            # self-contained shadcn-inspired kit
│   │   │   ├── layout/        # Sidebar, Topbar, AppShell
│   │   │   └── shared/        # PageHeader, GlassCard, CommandPalette, ...
│   │   ├── lib/               # utils, types, api
│   │   ├── store/             # zustand stores
│   │   └── hooks/             # useSystemStats, ...
│   ├── globals.css            # dark theme CSS variables + glass utility
│   ├── tailwind.config.ts
│   ├── tsconfig.json          # @/* -> ./src/*
│   ├── package.json
│   └── Dockerfile
│
├── docs/                      # documentation (this folder)
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── DEPLOYMENT.md
│   ├── API_REFERENCE.md
│   ├── openapi.yaml
│   ├── ROADMAP.md
│   ├── TESTING.md
│   ├── DEVELOPER.md
│   ├── FOLDER_STRUCTURE.md
│   ├── DEMO_SCRIPT.md
│   ├── PRESENTATION_OUTLINE.md
│   └── DATABASE_SCHEMA.md
│
├── scripts/                   # convenience shell scripts
│   ├── setup.sh
│   ├── start-backend.sh
│   ├── start-frontend.sh
│   └── pull-models.sh
│
├── docker/
│   └── README.md              # explains the compose setup
│
├── .github/
│   └── workflows/
│       └── ci.yml             # backend + frontend CI
│
├── assets/
│   ├── logo/README.md         # logo placeholder note
│   └── screenshots/README.md  # screenshots placeholder note
│
└── runtime storage (gitignored, keep .gitkeep):
    ├── uploads/.gitkeep       # uploaded documents/images
    ├── exports/.gitkeep       # generated exports
    ├── logs/.gitkeep          # backend logs
    ├── models/.gitkeep        # local model cache (if used)
    ├── database/.gitkeep      # SQLite database
    └── vectorstore/.gitkeep   # ChromaDB persistence
```

## Notes

- **Path alias:** in the frontend, `@/*` resolves to `./src/*` (set in `tsconfig.json`).
- **Runtime dirs** (`uploads/`, `exports/`, `logs/`, `models/`, `database/`, `vectorstore/`) are gitignored but tracked via `.gitkeep` so the structure exists on a fresh clone.
- **Backend layering** strictly flows routes → services → repositories; nothing skips a layer.
- **Frontend spine** (`lib/`, `store/`, `hooks/`, `components/ui|layout|shared`, `app/layout.tsx`) owns the shared contracts that module pages import.
