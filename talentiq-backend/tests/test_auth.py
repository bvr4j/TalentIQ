"""
Tests for auth endpoints: register, login, /me, refresh.
"""

import pytest
from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "name": "Test Recruiter",
        "email": "test@talentiq.ai",
        "password": "securepass123",
        "company": "TalentIQ",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "test@talentiq.ai"


def test_register_duplicate_email(client: TestClient):
    payload = {"name": "Alice", "email": "alice@test.ai", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_short_password(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@test.ai", "password": "short",
    })
    assert resp.status_code == 422


def test_login_success(client: TestClient):
    client.post("/api/auth/register", json={
        "name": "Login User", "email": "login@test.ai", "password": "password123",
    })
    resp = client.post("/api/auth/login", json={
        "email": "login@test.ai", "password": "password123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client: TestClient):
    client.post("/api/auth/register", json={
        "name": "Wrong Pass", "email": "wrong@test.ai", "password": "rightpass123",
    })
    resp = client.post("/api/auth/login", json={
        "email": "wrong@test.ai", "password": "wrongpass",
    })
    assert resp.status_code == 401


def test_get_me(client: TestClient):
    reg = client.post("/api/auth/register", json={
        "name": "Me User", "email": "me@test.ai", "password": "mepassword123",
    })
    token = reg.json()["access_token"]
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.ai"


def test_get_me_no_token(client: TestClient):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 403
