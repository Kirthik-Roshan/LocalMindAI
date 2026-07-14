#!/usr/bin/env bash
# ==========================================================
# LocalMind AI — start the FastAPI backend (port 8000)
# ==========================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"

HOST="${BACKEND_HOST:-0.0.0.0}"
PORT="${BACKEND_PORT:-8000}"

if [ -d ".venv" ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

echo "==> Starting backend on http://${HOST}:${PORT}"
echo "    Ollama host: ${OLLAMA_HOST:-http://localhost:11434}"
exec uvicorn app.main:app --reload --host "$HOST" --port "$PORT"
