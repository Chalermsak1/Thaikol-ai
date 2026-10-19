import pytest
from core.config import settings


def test_provider_health_endpoints_accessible(client):
    """GET /health/providers and GET /api/v1/health/providers return valid structure without leaking secrets."""
    # Test root endpoint
    res1 = client.get("/health/providers")
    assert res1.status_code == 200
    data1 = res1.json()

    assert data1["status"] == "ok"
    assert "providers" in data1
    assert "website" in data1["providers"]
    assert "facebook" in data1["providers"]
    assert "tiktok" in data1["providers"]

    # Verify no secret tokens leaked
    raw_text = res1.text.lower()
    assert "apify_api_" not in raw_text
    assert "secret" not in raw_text
    assert "bearer" not in raw_text

    # Test api v1 endpoint
    res2 = client.get("/api/v1/health/providers")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["providers"]["website"]["status"] == "available"


def test_provider_health_reflects_token_presence(client, monkeypatch):
    """Verifies that provider health correctly transitions between configured, unconfigured, and demo."""
    # 1. In DEMO_MODE:
    monkeypatch.setattr(settings, "DEMO_MODE", True)
    res_demo = client.get("/health/providers").json()
    assert res_demo["demo_mode"] is True
    assert res_demo["providers"]["tiktok"]["status"] == "demo"
    assert res_demo["providers"]["facebook"]["status"] == "demo"

    # 2. In LIVE MODE without token:
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    monkeypatch.setattr(settings, "APIFY_API_TOKEN", None)
    res_unconf = client.get("/health/providers").json()
    assert res_unconf["demo_mode"] is False
    assert res_unconf["providers"]["tiktok"]["status"] == "unconfigured"
    assert res_unconf["providers"]["facebook"]["status"] == "unconfigured"

    # 3. In LIVE MODE with token:
    monkeypatch.setattr(settings, "APIFY_API_TOKEN", "apify_api_test_dummy_token_12345")
    res_conf = client.get("/health/providers").json()
    assert res_conf["demo_mode"] is False
    assert res_conf["providers"]["tiktok"]["status"] == "configured"
    assert res_conf["providers"]["facebook"]["status"] == "configured"
