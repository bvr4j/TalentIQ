"""
Tests for jobs CRUD endpoints.
"""

import pytest
from fastapi.testclient import TestClient


def _get_token(client: TestClient, suffix: str = "jobs") -> str:
    resp = client.post("/api/auth/register", json={
        "name": "Jobs User",
        "email": f"{suffix}@jobs.ai",
        "password": "jobspass123",
    })
    return resp.json()["access_token"]


def test_create_job(client: TestClient):
    token = _get_token(client, "create")
    resp = client.post("/api/jobs", json={
        "title": "Senior Backend Engineer",
        "department": "Engineering",
        "description": "Build scalable APIs",
        "required_skills": "Python, FastAPI, PostgreSQL",
        "experience_level": "Senior",
    }, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Senior Backend Engineer"
    assert "id" in data


def test_list_jobs_empty(client: TestClient):
    token = _get_token(client, "list")
    resp = client.get("/api/jobs", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_and_list_jobs(client: TestClient):
    token = _get_token(client, "listfull")
    client.post("/api/jobs", json={"title": "Job A"}, headers={"Authorization": f"Bearer {token}"})
    client.post("/api/jobs", json={"title": "Job B"}, headers={"Authorization": f"Bearer {token}"})
    resp = client.get("/api/jobs", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_update_job(client: TestClient):
    token = _get_token(client, "update")
    create_resp = client.post("/api/jobs", json={"title": "Old Title"}, headers={"Authorization": f"Bearer {token}"})
    job_id = create_resp.json()["id"]
    update_resp = client.put(f"/api/jobs/{job_id}", json={"title": "New Title"}, headers={"Authorization": f"Bearer {token}"})
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "New Title"


def test_delete_job(client: TestClient):
    token = _get_token(client, "delete")
    create_resp = client.post("/api/jobs", json={"title": "Delete Me"}, headers={"Authorization": f"Bearer {token}"})
    job_id = create_resp.json()["id"]
    del_resp = client.delete(f"/api/jobs/{job_id}", headers={"Authorization": f"Bearer {token}"})
    assert del_resp.status_code == 204
    get_resp = client.get(f"/api/jobs/{job_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_resp.status_code == 404


def test_jobs_require_auth(client: TestClient):
    resp = client.get("/api/jobs")
    assert resp.status_code == 403
