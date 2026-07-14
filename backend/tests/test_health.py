"""Health and system endpoint tests. These pass with Ollama offline."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_health() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["service"] == "localmind"
    assert "version" in body


def test_api_v1_health() -> None:
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"


def test_system_stats_shape() -> None:
    resp = client.get("/api/v1/system/stats")
    assert resp.status_code == 200
    body = resp.json()
    for key in ("cpu_percent", "memory", "disk", "indexed_files", "storage", "ollama", "health"):
        assert key in body
    assert body["health"] in {"healthy", "degraded", "offline"}
    assert set(body["memory"]) == {"used_gb", "total_gb", "percent"}
    assert isinstance(body["ollama"]["online"], bool)


def test_dashboard_overview_shape() -> None:
    resp = client.get("/api/v1/dashboard/overview")
    assert resp.status_code == 200
    body = resp.json()
    assert "stats" in body
    assert {"documents", "notes", "ai_actions", "indexed_chunks"} <= set(body["stats"])
    assert isinstance(body["recent_documents"], list)
    assert isinstance(body["recent_actions"], list)
    assert isinstance(body["recent_workspaces"], list)


def test_models_endpoint() -> None:
    resp = client.get("/api/v1/models")
    assert resp.status_code == 200
    body = resp.json()
    assert "models" in body
    assert "current" in body
    assert isinstance(body["online"], bool)
