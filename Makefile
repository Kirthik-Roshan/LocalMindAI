# ==========================================================
# LocalMind AI — Makefile
# Privacy-first offline AI workspace (Ollama-powered)
# ==========================================================

.DEFAULT_GOAL := help
.PHONY: help setup dev-backend dev-frontend up down test models clean

OLLAMA_HOST ?= http://localhost:11434
CHAT_MODEL  ?= qwen2.5:3b
EMBED_MODEL ?= all-minilm

help: ## Show this help
	@echo "LocalMind AI — available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Install backend + frontend dependencies
	@echo "==> Setting up backend"
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	@echo "==> Setting up frontend"
	cd frontend && npm install
	@echo "==> Done. Now run 'make models' to pull Ollama models."

models: ## Pull the default Ollama models (chat + embeddings)
	@echo "==> Pulling $(CHAT_MODEL)"
	ollama pull $(CHAT_MODEL)
	@echo "==> Pulling $(EMBED_MODEL)"
	ollama pull $(EMBED_MODEL)

dev-backend: ## Run the FastAPI backend on :8000
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run the Next.js frontend on :3000
	cd frontend && npm run dev

up: ## Start the full stack via docker compose
	docker compose up --build

down: ## Stop the docker compose stack
	docker compose down

test: ## Run backend + frontend tests
	@echo "==> Backend tests"
	cd backend && . .venv/bin/activate && pytest -q || true
	@echo "==> Frontend build check"
	cd frontend && npm run build

clean: ## Remove build artifacts and caches
	rm -rf frontend/.next frontend/out
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -rf backend/.pytest_cache backend/.ruff_cache
