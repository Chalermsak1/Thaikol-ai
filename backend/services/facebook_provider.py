from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from core.config import settings
from core.logging import logger
from schemas.brand import FacebookPageContent, FacebookPost
from .cache import cache_service
from .interfaces import FacebookProvider


class MockFacebookProvider(FacebookProvider):
    """Deterministic mock provider for offline testing and DEMO_MODE execution."""

    def extract_page_content(self, page_url: str) -> Dict[str, Any]:
        extracted_at = datetime.now(timezone.utc).isoformat()
        clean_url = page_url.strip().rstrip("/")

        # Check Cache
        cache_key = cache_service.build_key("facebook", clean_url)
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        # Default fixture mimicking authentic Thai business page (Khaokho Talaypu or general brand)
        if "khaokho" in clean_url.lower() or settings.DEMO_MODE:
            result = FacebookPageContent(
                page_url=clean_url,
                page_name="Khaokho Talaypu เขาค้อทะเลภู",
                page_category="Health & Beauty / เครื่องสำอางและผลิตภัณฑ์ดูแลร่างกาย",
                about=(
                    "เขาค้อทะเลภู ผู้นำผลิตภัณฑ์ดูแลเส้นผมและผิวพรรณจากธรรมชาติ 100% "
                    "สกัดจากสมุนไพรไทยแท้ ปราศจากสารเคมีอันตราย ซิลิโคน และพาราเบน "
                    "เพื่อสุขภาพผมและผิวที่แข็งแรงยั่งยืน 🌿 ปลูกและผลิตในประเทศไทย"
                ),
                follower_count=248000,
                recent_posts=[
                    FacebookPost(
                        post_id="fb_post_001",
                        text=(
                            "ผมร่วง ผมบาง ต้องลองแชมพูอัญชันและกะเม็งจากเขาค้อทะเลภู! "
                            "สมุนไพรธรรมชาติแท้ 100% ช่วยกระตุ้นรากผมให้แข็งแรง ปราศจาก SLS/SLES "
                            "และซิลิโคน ลดการหลุดร่วงอย่างเห็นผล 💜🍃 #เขาค้อทะเลภู #แชมพูสมุนไพร #ลดผมร่วง"
                        ),
                        published_at="2026-09-10T10:30:00Z",
                        likes=1420,
                        comments=86,
                        shares=112,
                        post_url=f"{clean_url}/posts/fb_post_001",
                    ),
                    FacebookPost(
                        post_id="fb_post_002",
                        text=(
                            "ปลอบประโลมผิวหน้าร้อนด้วยเจลว่านหางจระเข้ออร์แกนิก 100% ซึมไว "
                            "ไม่เหนอะหนะ เติมน้ำให้ผิวแพ้ง่ายอย่างอ่อนโยน ปราศจากแอลกอฮอล์และน้ำหอม ☀️💧 "
                            "#organic #skincare #ผิวแพ้ง่าย #เขาค้อทะเลภู"
                        ),
                        published_at="2026-09-05T14:15:00Z",
                        likes=890,
                        comments=45,
                        shares=64,
                        post_url=f"{clean_url}/posts/fb_post_002",
                    ),
                    FacebookPost(
                        post_id="fb_post_003",
                        text=(
                            "เปิดกรุไอเทมดูแลหนังศีรษะมันและคัน รังแคหายด้วยแชมพูขิงและโสมสกัดเข้มข้น "
                            "เย็นสดชื่น เบาสบายหัวตลอดวัน 🌿✨ #แชมพูขิง #ลดรังแค #สมุนไพรไทย"
                        ),
                        published_at="2026-08-28T09:00:00Z",
                        likes=1150,
                        comments=62,
                        shares=78,
                        post_url=f"{clean_url}/posts/fb_post_003",
                    ),
                ],
                extracted_at=extracted_at,
                extraction_status="success",
                error=None,
            )
        else:
            # Generic fallback mock for other URLs
            slug = clean_url.split("/")[-1].replace("-", " ").title()
            result = FacebookPageContent(
                page_url=clean_url,
                page_name=f"{slug} Official",
                page_category="Business & Brand",
                about=f"Official Facebook page for {slug}. Providing quality products and customer service.",
                follower_count=15000,
                recent_posts=[
                    FacebookPost(
                        post_id="post_generic_1",
                        text=f"Welcome to {slug}! Explore our latest products and exclusive updates.",
                        published_at=extracted_at,
                        likes=120,
                        comments=15,
                        shares=8,
                        post_url=f"{clean_url}/posts/post_generic_1",
                    )
                ],
                extracted_at=extracted_at,
                extraction_status="success",
                error=None,
            )

        data = result.model_dump()
        cache_service.set(cache_key, data)
        return data


class ApifyFacebookProvider(FacebookProvider):
    """Apify-backed Facebook scraper for extracting public page details and posts."""

    def __init__(self, api_token: Optional[str] = None, actor_id: Optional[str] = None):
        self.api_token = api_token or settings.APIFY_API_TOKEN
        self.actor_id = actor_id or settings.APIFY_FACEBOOK_ACTOR_ID

    def extract_page_content(self, page_url: str) -> Dict[str, Any]:
        extracted_at = datetime.now(timezone.utc).isoformat()
        clean_url = page_url.strip()

        # Check Cache
        cache_key = cache_service.build_key("facebook", clean_url)
        cached = cache_service.get(cache_key)
        if cached:
            logger.debug("Serving cached Facebook content for: %s", clean_url)
            return cached

        # Check API token
        if not self.api_token:
            logger.warning("Apify API token missing; falling back to controlled error")
            return FacebookPageContent(
                page_url=clean_url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error="APIFY_API_TOKEN is not configured in backend environment.",
            ).model_dump()

        actor_url = f"https://api.apify.com/v2/acts/{self.actor_id}/run-sync-get-dataset-items"
        params = {"token": self.api_token}
        payload = {
            "startUrls": [{"url": clean_url}],
            "maxPosts": 5,
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(actor_url, params=params, json=payload)
                response.raise_for_status()
                items = response.json()

                if not items or not isinstance(items, list):
                    return FacebookPageContent(
                        page_url=clean_url,
                        extracted_at=extracted_at,
                        extraction_status="failed",
                        error="Apify actor returned empty or invalid response dataset.",
                    ).model_dump()

                first_item = items[0]
                posts: List[FacebookPost] = []
                for p in first_item.get("posts", []):
                    posts.append(
                        FacebookPost(
                            post_id=str(p.get("id") or p.get("postId") or "post"),
                            text=p.get("text") or p.get("message") or "",
                            published_at=p.get("time") or p.get("timestamp"),
                            likes=int(p.get("likes") or 0),
                            comments=int(p.get("comments") or 0),
                            shares=int(p.get("shares") or 0),
                            post_url=p.get("url") or clean_url,
                        )
                    )

                content = FacebookPageContent(
                    page_url=clean_url,
                    page_name=first_item.get("name") or first_item.get("title"),
                    page_category=first_item.get("category"),
                    about=first_item.get("about") or first_item.get("description"),
                    follower_count=int(first_item.get("likes") or first_item.get("followers") or 0),
                    recent_posts=posts,
                    extracted_at=extracted_at,
                    extraction_status="success",
                    error=None,
                )
                data = content.model_dump()
                cache_service.set(cache_key, data)
                return data

        except Exception as err:
            logger.error("Apify Facebook scraper error: %s", err)
            return FacebookPageContent(
                page_url=clean_url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error=f"Apify scraper execution failed: {str(err)}",
            ).model_dump()


def get_facebook_provider() -> FacebookProvider:
    """Factory selecting ApifyFacebookProvider if token is set and not in DEMO_MODE;

    otherwise MockFacebookProvider for reliable zero-cost demoing.
    """
    if not settings.DEMO_MODE and settings.APIFY_API_TOKEN:
        return ApifyFacebookProvider()
    return MockFacebookProvider()
