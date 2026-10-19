from datetime import datetime, timezone
from fastapi import APIRouter
from core.config import settings
from core.database import check_db_connection
from schemas.health import HealthResponse, ProviderHealthResponse, ProviderStatusItem
from services.facebook_provider import get_facebook_provider
from services.tiktok_provider import get_tiktok_provider
from services.website_provider import ProductionWebsiteProvider

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


@router.get("/health/providers", response_model=ProviderHealthResponse, summary="External Data Providers Health Status")
@router.get("/providers", response_model=ProviderHealthResponse, summary="External Data Providers Health Status")
def get_providers_health() -> ProviderHealthResponse:
    """Inspects external data providers configuration and availability without exposing secrets."""
    fb_prov = get_facebook_provider()
    tiktok_prov = get_tiktok_provider()

    # Determine status for Facebook
    if settings.DEMO_MODE:
        fb_status = "demo"
        fb_detail = "Offline curated demo fixture provider active."
    elif settings.APIFY_API_TOKEN:
        fb_status = "configured"
        fb_detail = f"Apify Facebook Pages Scraper ({settings.APIFY_FACEBOOK_ACTOR_ID}) configured."
    else:
        fb_status = "unconfigured"
        fb_detail = "APIFY_API_TOKEN missing. Live Facebook extraction unavailable."

    # Determine status for TikTok
    if settings.DEMO_MODE:
        tk_status = "demo"
        tk_detail = "Offline curated demo fixture provider active."
    elif settings.APIFY_API_TOKEN:
        tk_status = "configured"
        tk_detail = f"Apify TikTok Scraper ({settings.APIFY_TIKTOK_ACTOR_ID}) configured."
    else:
        tk_status = "unconfigured"
        tk_detail = "APIFY_API_TOKEN missing. Live TikTok creator discovery unavailable."

    providers = {
        "website": ProviderStatusItem(
            name="website",
            status="available",
            provider_class=ProductionWebsiteProvider.__name__,
            details="Direct public HTTP extraction with SSRF defense and HTML parsing active.",
        ),
        "facebook": ProviderStatusItem(
            name="facebook",
            status=fb_status,
            provider_class=fb_prov.__class__.__name__,
            details=fb_detail,
        ),
        "tiktok": ProviderStatusItem(
            name="tiktok",
            status=tk_status,
            provider_class=tiktok_prov.__class__.__name__,
            details=tk_detail,
        ),
    }

    return ProviderHealthResponse(
        status="ok",
        demo_mode=settings.DEMO_MODE,
        providers=providers,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
