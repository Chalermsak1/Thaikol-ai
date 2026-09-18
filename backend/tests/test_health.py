from starlette.testclient import TestClient


def test_root_health_returns_200(client: TestClient):
    """Test that the direct /health endpoint returns 200 OK and valid health schema."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "ThaiKOL AI"
    assert "version" in data
    assert "demo_mode" in data
    assert isinstance(data["demo_mode"], bool)
    assert data["demo_mode"] is True
    assert "database_connected" in data
    assert "timestamp" in data


def test_api_v1_health_returns_200(client: TestClient):
    """Test that the versioned /api/v1/health endpoint returns 200 OK."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "ThaiKOL AI"


def test_root_endpoint_returns_200(client: TestClient):
    """Test that the root / endpoint returns welcome payload with links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "ThaiKOL AI"
    assert data["docs_url"] == "/docs"
    assert data["health_url"] == "/health"
