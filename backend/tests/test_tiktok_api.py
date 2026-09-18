import pytest
from starlette.testclient import TestClient


def test_discover_tiktok_api_success(client: TestClient):
    payload = {
        "queries": ["แชมพูสมุนไพร", "ลดผมร่วง"],
        "max_results_per_query": 10,
        "max_candidates": 10,
    }

    response = client.post("/api/v1/tiktok/discover", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "discovery_run_id" in data
    assert data["status"] in ("success", "partial")
    assert data["candidate_count"] > 0
    assert len(data["candidates"]) > 0

    first_cand = data["candidates"][0]
    assert "username" in first_cand
    assert "normalized_username" in first_cand
    assert "profile_url" in first_cand
    assert "sample_video_count" in first_cand
    assert "local_signal_score" in first_cand
    assert 0.0 <= first_cand["local_signal_score"] <= 1.0


def test_discover_tiktok_api_query_cleaning_and_validation(client: TestClient):
    # Empty query list should trigger 422 Unprocessable Entity
    bad_payload = {"queries": []}
    res_bad = client.post("/api/v1/tiktok/discover", json=bad_payload)
    assert res_bad.status_code == 422

    # Whitespace queries only should trigger 422
    whitespace_payload = {"queries": ["   ", ""]}
    res_ws = client.post("/api/v1/tiktok/discover", json=whitespace_payload)
    assert res_ws.status_code == 422

    # Queries with duplicates and extra spaces should be cleaned automatically
    dedup_payload = {"queries": [" แชมพู ", "แชมพู", "hair care"]}
    res_ok = client.post("/api/v1/tiktok/discover", json=dedup_payload)
    assert res_ok.status_code == 200


def test_list_candidates_api(client: TestClient):
    # First ensure at least one discovery has populated candidates/fixtures
    client.post("/api/v1/tiktok/discover", json={"queries": ["organic", "skincare"]})

    # Call candidates listing endpoint
    response = client.get("/api/v1/tiktok/candidates?limit=5")
    assert response.status_code == 200
    candidates = response.json()

    assert isinstance(candidates, list)
    assert len(candidates) > 0
    assert "username" in candidates[0]
    assert "profile_url" in candidates[0]


def test_get_discovery_run_not_found(client: TestClient):
    # Nonexistent run ID
    response = client.get("/api/v1/tiktok/discovery-runs/nonexistent-run-id-99999")
    assert response.status_code in (404, 503)
