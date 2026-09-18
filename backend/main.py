from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.logging import logger
from core.database import check_db_connection
from api.v1 import api_router
from api.v1.endpoints.health import get_health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing %s (v%s)", settings.PROJECT_NAME, settings.VERSION)
    logger.info("Environment: %s | Demo Mode: %s", settings.ENVIRONMENT, settings.DEMO_MODE)
    db_connected = check_db_connection()
    logger.info("Database connectivity check: %s", "CONNECTED" if db_connected else "DISCONNECTED (demo fallback ready)")
    yield
    # Shutdown
    logger.info("Shutting down %s", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered TikTok KOL Matcher for Thai Brands (Internship Assessment Prototype)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Direct root health endpoint as specifically requested (GET /health)
app.add_api_route(
    "/health",
    get_health,
    methods=["GET"],
    tags=["Health"],
    summary="Direct Root Healthcheck",
)

# API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def read_root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
        "health_url": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
