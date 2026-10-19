from typing import Optional, Dict
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="System health status (e.g. ok, degraded)")
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Current release version")
    environment: str = Field(..., description="Runtime environment (development, staging, production)")
    demo_mode: bool = Field(..., description="Indicates whether demo fixture fallback mode is active")
    database_connected: bool = Field(..., description="Database connection health status")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of the health check")


class ProviderStatusItem(BaseModel):
    name: str = Field(..., description="Provider identifier (website, facebook, tiktok)")
    status: str = Field(..., description="Status: available | configured | unconfigured | demo | unavailable")
    provider_class: str = Field(..., description="Active provider class")
    details: Optional[str] = Field(None, description="Informational details without secrets")


class ProviderHealthResponse(BaseModel):
    status: str = Field("ok", description="Overall provider health status")
    demo_mode: bool = Field(..., description="Whether system is in DEMO_MODE")
    providers: dict[str, ProviderStatusItem] = Field(..., description="Status breakdown per provider")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
