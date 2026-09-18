from datetime import datetime, timezone
from fastapi import APIRouter
from core.config import settings
from core.database import check_db_connection
from schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="System Health Status")
def get_health() -> HealthResponse:
    """Returns system status, environment, demo mode flag, and database connection state."""
    db_ok = check_db_connection()
    return HealthResponse(
        status="ok",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        demo_mode=settings.DEMO_MODE,
        database_connected=db_ok,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
