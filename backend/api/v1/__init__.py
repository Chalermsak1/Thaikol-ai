from fastapi import APIRouter
from .endpoints import health, brands, tiktok, matching

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(brands.router, prefix="/brands", tags=["Brands"])
api_router.include_router(tiktok.router, prefix="/tiktok", tags=["TikTok"])
api_router.include_router(matching.router, prefix="/matching", tags=["Matching"])
