import os
import sys
from pathlib import Path
import pytest
from starlette.testclient import TestClient

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app


@pytest.fixture(autouse=True)
def ensure_test_mode(monkeypatch):
    """Ensures test suite defaults to deterministic DEMO_MODE unless explicitly testing live mode."""
    from core.config import settings
    monkeypatch.setattr(settings, "DEMO_MODE", True)
    monkeypatch.setattr(settings, "APIFY_API_TOKEN", None)


@pytest.fixture(scope="session")
def client():
    """Yields FastAPI test client instance."""
    with TestClient(app) as test_client:
        yield test_client
