"""FastAPI application factory for LocalMind AI."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.db.database import init_db

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure directories, logging and DB are ready before serving traffic."""
    configure_logging()
    settings.ensure_directories()
    try:
        init_db()
    except Exception as exc:  # pragma: no cover - defensive; server should still boot
        logger.error("Database initialization failed: %s", exc)
    logger.info("%s v%s started", settings.app_name, settings.version)
    yield
    logger.info("%s shutting down", settings.app_name)


def create_app() -> FastAPI:
    configure_logging()

    # Initialize storage + DB eagerly so the app is fully usable even when the
    # ASGI lifespan is not triggered (e.g. TestClient without a context manager).
    settings.ensure_directories()
    try:
        init_db()
    except Exception as exc:  # pragma: no cover - defensive; server should still boot
        logger.error("Eager database initialization failed: %s", exc)

    app = FastAPI(
        title="LocalMind AI",
        version=settings.version,
        description="Privacy-first, fully offline AI workspace backend.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected internal error occurred."},
        )

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok", "service": settings.app_name, "version": settings.version}

    app.include_router(api_router)
    return app


app = create_app()
