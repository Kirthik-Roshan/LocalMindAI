#!/usr/bin/env bash
# ==========================================================
# LocalMind AI — one-shot setup
# Installs backend + frontend dependencies.
# ==========================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> LocalMind AI setup"
echo "    Root: $ROOT"

# ---------- .env ----------
if [ ! -f "$ROOT/.env" ]; then
  echo "==> Creating .env from .env.example"
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

# ---------- Backend ----------
if [ -d "$ROOT/backend" ]; then
  echo "==> Setting up backend (Python venv)"
  cd "$ROOT/backend"
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install --upgrade pip
  if [ -f requirements.txt ]; then
    pip install -r requirements.txt
  fi
  deactivate
  cd "$ROOT"
else
  echo "!! backend/ not found, skipping backend setup"
fi

# ---------- Frontend ----------
if [ -d "$ROOT/frontend" ]; then
  echo "==> Setting up frontend (npm install)"
  cd "$ROOT/frontend"
  npm install
  cd "$ROOT"
else
  echo "!! frontend/ not found, skipping frontend setup"
fi

echo ""
echo "==> Setup complete."
echo "    Next: ./scripts/pull-models.sh   (pull Ollama models)"
echo "    Then: ./scripts/start-backend.sh  and  ./scripts/start-frontend.sh"
