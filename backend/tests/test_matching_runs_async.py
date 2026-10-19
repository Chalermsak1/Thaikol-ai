import time
import pytest
from core.config import settings
from services.matching_run_manager import matching_run_manager


def test_async_matching_run_workflow(client, monkeypatch):
    """Verifies that an asynchronous matching run is queued, updates progress, and completes with recommendations."""
    monkeypatch.setattr(settings, "DEMO_MODE", True)

    # 1. Enqueue matching run
    post_res = client.post(
        "/api/v1/matching/runs",
        json={
            "website_url": "https://khaokhotalaypu.com",
            "facebook_page_url": "https://facebook.com/KhaokhoTalaypu",
            "limit": 5,
        },
    )
    assert post_res.status_code == 202
    data = post_res.json()
    assert "run_id" in data
    assert data["status"] in ("queued", "running", "completed")
    run_id = data["run_id"]

    # 2. Poll until completed (in DEMO_MODE, it runs in a few seconds)
    max_wait = 15.0
    start = time.time()
    final_status = None
    while time.time() - start < max_wait:
        poll_res = client.get(f"/api/v1/matching/runs/{run_id}")
        assert poll_res.status_code == 200
        poll_data = poll_res.json()
        assert poll_data["run_id"] == run_id
        assert poll_data["progress_percent"] >= 0
        if poll_data["status"] in ("completed", "failed"):
            final_status = poll_data
            break
        time.sleep(0.2)

    assert final_status is not None, "Run did not complete within expected timeout"
    assert final_status["status"] == "completed"
    assert final_status["progress_percent"] == 100
    assert final_status["stage"] == "completed"
    assert final_status["result"] is not None

    # 3. Retrieve results directly via dedicated endpoint
    res_endpoint = client.get(f"/api/v1/matching/runs/{run_id}/results")
    assert res_endpoint.status_code == 200
    results_data = res_endpoint.json()
    assert results_data["status"] == "success"
    assert len(results_data["recommendations"]) > 0

    # 4. List all runs
    list_res = client.get("/api/v1/matching/runs")
    assert list_res.status_code == 200
    runs_list = list_res.json()
    assert any(r["run_id"] == run_id for r in runs_list)


def test_async_matching_run_not_found(client):
    """GET /api/v1/matching/runs/nonexistent returns HTTP 404."""
    res = client.get("/api/v1/matching/runs/non-existent-uuid-12345")
    assert res.status_code == 404


def test_async_matching_run_cancellation(client, monkeypatch):
    """DELETE /api/v1/matching/runs/{run_id} cancels an active run."""
    monkeypatch.setattr(settings, "DEMO_MODE", True)

    post_res = client.post(
        "/api/v1/matching/runs",
        json={"website_url": "https://khaokhotalaypu.com"},
    )
    assert post_res.status_code == 202
    run_id = post_res.json()["run_id"]

    # Cancel immediately
    del_res = client.delete(f"/api/v1/matching/runs/{run_id}")
    # Can be 200 (if cancelled) or 400 (if already completed in microsecond mock)
    assert del_res.status_code in (200, 400)
    if del_res.status_code == 200:
        assert del_res.json()["status"] == "cancelled"
