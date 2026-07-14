"""Workspace tests: notes CRUD + transform (works with Ollama offline)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_notes_crud_cycle() -> None:
    # Create
    resp = client.post(
        "/api/v1/workspace/notes",
        json={"title": "Test Note", "content": "Hello world"},
    )
    assert resp.status_code == 201
    note = resp.json()
    note_id = note["id"]
    assert note["title"] == "Test Note"
    assert note["content"] == "Hello world"
    assert "created_at" in note and "updated_at" in note

    # List contains the new note
    resp = client.get("/api/v1/workspace/notes")
    assert resp.status_code == 200
    assert any(n["id"] == note_id for n in resp.json())

    # Update
    resp = client.put(
        f"/api/v1/workspace/notes/{note_id}",
        json={"content": "Updated content"},
    )
    assert resp.status_code == 200
    assert resp.json()["content"] == "Updated content"

    # Delete
    resp = client.delete(f"/api/v1/workspace/notes/{note_id}")
    assert resp.status_code == 200
    assert resp.json()["deleted"] is True

    # Deleting again -> 404
    resp = client.delete(f"/api/v1/workspace/notes/{note_id}")
    assert resp.status_code == 404
    assert "detail" in resp.json()


def test_update_missing_note_returns_404() -> None:
    resp = client.put("/api/v1/workspace/notes/999999", json={"title": "x"})
    assert resp.status_code == 404


def test_transform_returns_result_even_offline() -> None:
    resp = client.post(
        "/api/v1/workspace/transform",
        json={"text": "make this better", "action": "improve"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["action"] == "improve"
    # Whether Ollama is online or not, a non-empty string result is returned.
    assert isinstance(body["result"], str)
    assert len(body["result"]) > 0


def test_transform_rejects_empty_text() -> None:
    resp = client.post(
        "/api/v1/workspace/transform",
        json={"text": "", "action": "improve"},
    )
    assert resp.status_code == 422


def test_settings_get_and_update() -> None:
    resp = client.get("/api/v1/settings")
    assert resp.status_code == 200
    body = resp.json()
    assert body["model"]
    assert body["theme"] in {"dark", "light"}

    resp = client.put("/api/v1/settings", json={"temperature": 0.42})
    assert resp.status_code == 200
    assert abs(resp.json()["temperature"] - 0.42) < 1e-6
