#!/usr/bin/env bash
# ==========================================================
# LocalMind AI — start the Next.js frontend (port 3000)
# ==========================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/frontend"

export NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-http://localhost:8000}"

if [ ! -d "node_modules" ]; then
  echo "==> node_modules missing, running npm install"
  npm install
fi

echo "==> Starting frontend on http://localhost:3000"
echo "    API base: ${NEXT_PUBLIC_API_BASE}"
exec npm run dev
