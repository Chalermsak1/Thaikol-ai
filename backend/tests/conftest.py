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


@pytest.fixture(scope="session")
def client():
    """Yields FastAPI test client instance."""
    with TestClient(app) as test_client:
        yield test_client
