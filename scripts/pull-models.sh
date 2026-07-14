#!/usr/bin/env bash
# ==========================================================
# LocalMind AI — pull the default Ollama models
# ==========================================================
set -euo pipefail

CHAT_MODEL="${LOCALMIND_CHAT_MODEL:-qwen2.5:3b}"
EMBED_MODEL="${LOCALMIND_EMBEDDING_MODEL:-all-minilm}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "!! Ollama is not installed or not on PATH."
  echo "   Install it from https://ollama.com/download and re-run this script."
  exit 1
fi

echo "==> Pulling chat/reasoning model: ${CHAT_MODEL}"
ollama pull "${CHAT_MODEL}"

echo "==> Pulling embedding model: ${EMBED_MODEL}"
ollama pull "${EMBED_MODEL}"

echo ""
echo "==> Models ready. Installed models:"
ollama list
