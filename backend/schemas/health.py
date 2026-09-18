from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="System health status (e.g. ok, degraded)")
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Current release version")
    environment: str = Field(..., description="Runtime environment (development, staging, production)")
    demo_mode: bool = Field(..., description="Indicates whether demo fixture fallback mode is active")
    database_connected: bool = Field(..., description="Database connection health status")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of the health check")
