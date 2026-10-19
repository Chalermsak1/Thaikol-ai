import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from core.config import settings
from core.logging import logger
from .cache import cache_service
from .interfaces import TikTokProvider
from .provider_exceptions import (
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderError,
    ProviderRateLimitError,
    ProviderTimeoutError,
)


def _find_fixtures_path() -> Path:
    """Resolves path to sample_kols.json across various execution environments."""
    candidate_paths = [
        Path(__file__).resolve().parents[3] / "data" / "fixtures" / "sample_kols.json",
        Path(__file__).resolve().parents[2] / "data" / "fixtures" / "sample_kols.json",
        Path(__file__).resolve().parents[1] / "data" / "fixtures" / "sample_kols.json",
        Path.cwd() / "data" / "fixtures" / "sample_kols.json",
        Path.cwd().parent / "data" / "fixtures" / "sample_kols.json",
    ]
    for p in candidate_paths:
        if p.exists():
            return p
    return Path("data/fixtures/sample_kols.json")


class MockTikTokProvider(TikTokProvider):
    """Deterministic, offline mock provider for DEMO_MODE execution and test suites.

    Operates 100% locally using data/fixtures/sample_kols.json.
    """

    def __init__(self, fixtures_path: Optional[Path] = None):
        self.fixtures_path = fixtures_path or _find_fixtures_path()
        self._fixture_cache: Optional[List[Dict[str, Any]]] = None

    def _load_fixtures(self) -> List[Dict[str, Any]]:
        if self._fixture_cache is not None:
            return self._fixture_cache

        try:
            with open(self.fixtures_path, "r", encoding="utf-8") as f:
                self._fixture_cache = json.load(f)
                return self._fixture_cache
        except Exception as e:
            logger.error("Failed to load sample_kols.json from %s: %s", self.fixtures_path, e)
            self._fixture_cache = []
            return []

    def _creator_matches_query(self, creator: Dict[str, Any], query: str) -> bool:
        """Determines if a fixture creator matches a search term."""
        q = query.strip().lower()
        if not q or q in ("*", "all", "general", "any"):
            return True

        handle = (creator.get("tiktok_handle") or "").lower()
        name = (creator.get("display_name") or "").lower()
        cat = (creator.get("category") or "").lower()
        bio = (creator.get("bio") or "").lower()

        if q in handle or q in name or q in cat or q in bio:
            return True

        tags = [t.lower() for t in creator.get("content_tags", []) if isinstance(t, str)]
        if any(q in t for t in tags):
            return True

        captions = [c.lower() for c in creator.get("recent_captions", []) if isinstance(c, str)]
        if any(q in c for c in captions):
            return True

        for vid in creator.get("sample_videos", []):
            vid_cap = (vid.get("caption") or "").lower()
            if q in vid_cap:
                return True
            vid_tags = [h.lower() for h in vid.get("hashtags", []) if isinstance(h, str)]
            if any(q in h for h in vid_tags):
                return True

        return False

    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Discovers public TikTok creator sample videos matching given search queries."""
        fixtures = self._load_fixtures()
        if not fixtures:
            return []

        results: List[Dict[str, Any]] = []
        clean_keywords = [k.strip() for k in keywords if isinstance(k, str) and k.strip()]

        if not clean_keywords:
            clean_keywords = ["general"]

        for query in clean_keywords:
            matched_creators = [
                c for c in fixtures if self._creator_matches_query(c, query)
            ]

            target_creators = matched_creators
            if not target_creators and any(
                term in query.lower()
                for term in [
                    "hair",
                    "skin",
                    "shampoo",
                    "สมุนไพร",
                    "ผม",
                    "ผิว",
                    "organic",
                    "beauty",
                ]
            ):
                target_creators = fixtures

            for creator in target_creators:
                handle = creator.get("tiktok_handle") or "unknown_user"
                display_name = creator.get("display_name") or handle
                profile_url = creator.get("profile_url")
                is_profile_verified = bool(creator.get("is_profile_verified", False))
                profile_status = creator.get("profile_status", "unavailable")
                bio = creator.get("bio")
                followers = (creator.get("metrics") or {}).get("followers") or creator.get(
                    "follower_count"
                )

                sample_videos = creator.get("sample_videos") or []
                default_vid_url = (
                    f"{profile_url}/video/7000000000001"
                    if profile_url
                    else f"https://www.tiktok.com/video/{handle}_01"
                )
                if not sample_videos:
                    sample_videos = [
                        {
                            "video_id": f"vid_{handle}_01",
                            "video_url": default_vid_url,
                            "caption": (
                                creator.get("recent_captions", [""])[0]
                                if creator.get("recent_captions")
                                else bio
                            ),
                            "views": (creator.get("metrics") or {}).get("avg_views", 10000),
                            "likes": int(
                                ((creator.get("metrics") or {}).get("avg_views", 10000))
                                * 0.05
                            ),
                            "comments": int(
                                ((creator.get("metrics") or {}).get("avg_views", 10000))
                                * 0.003
                            ),
                            "shares": int(
                                ((creator.get("metrics") or {}).get("avg_views", 10000))
                                * 0.002
                            ),
                            "saves": int(
                                ((creator.get("metrics") or {}).get("avg_views", 10000))
                                * 0.005
                            ),
                            "hashtags": creator.get("content_tags", []),
                            "created_at": "2026-09-01T00:00:00Z",
                        }
                    ]

                for vid in sample_videos:
                    vid_url = vid.get("video_url") or (
                        f"{profile_url}/video/default"
                        if profile_url
                        else f"https://www.tiktok.com/video/{handle}_default"
                    )
                    results.append(
                        {
                            "video_id": vid.get("video_id")
                            or f"vid_{handle}_{hash(vid.get('caption', '')) % 10000}",
                            "video_url": vid_url,
                            "creator_username": handle,
                            "creator_display_name": display_name,
                            "creator_bio": bio,
                            "creator_profile_url": profile_url,
                            "creator_avatar_url": creator.get("avatar_url"),
                            "video_thumbnail_url": vid.get("thumbnail_url") or vid.get("video_thumbnail_url") or creator.get("video_thumbnail_url"),
                            "is_profile_verified": is_profile_verified,
                            "profile_status": profile_status,
                            "follower_count": followers,
                            "views": vid.get("views"),
                            "likes": vid.get("likes"),
                            "comments": vid.get("comments"),
                            "shares": vid.get("shares"),
                            "saves": vid.get("saves"),
                            "hashtags": vid.get("hashtags") or [],
                            "caption": vid.get("caption"),
                            "created_at": vid.get("created_at"),
                            "data_source": "demo_fixture",
                            "is_demo_fixture": True,
                            "provenance": "curated_demo_fixture",
                            "matched_query": query,
                        }
                    )

        return results[:limit]

    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        """Fetches public profile metadata and baseline metrics from sample fixtures."""
        clean_handle = handle.strip().lstrip("@").lower()
        fixtures = self._load_fixtures()
        for creator in fixtures:
            creator_handle = (creator.get("tiktok_handle") or "").strip().lstrip("@").lower()
            if creator_handle == clean_handle:
                return creator
        return {}


class UnconfiguredTikTokProvider(TikTokProvider):
    """Explicitly signals that live creator discovery was requested without configuration.

    Never silently falls back to demo fixtures in LIVE mode.
    """

    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        logger.error("Live TikTok discovery invoked without configured APIFY_API_TOKEN.")
        raise ProviderConfigurationError(
            "Live TikTok data provider is not configured. APIFY_API_TOKEN is missing from environment. "
            "Please set APIFY_API_TOKEN in your backend environment to discover live creators, "
            "or set DEMO_MODE=true for offline testing.",
            provider="ApifyTikTokProvider",
        )

    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        logger.error("Live TikTok profile lookup invoked without configured APIFY_API_TOKEN.")
        raise ProviderConfigurationError(
            "Live TikTok data provider is not configured. APIFY_API_TOKEN is missing from environment.",
            provider="ApifyTikTokProvider",
        )


class ApifyTikTokProvider(TikTokProvider):
    """Production provider integrating Apify's public TikTok Scraper with bounded retries."""

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token if api_token is not None else settings.APIFY_API_TOKEN
        self.actor_id = settings.APIFY_TIKTOK_ACTOR_ID.replace("/", "~")
        self.base_url = f"https://api.apify.com/v2/acts/{self.actor_id}/run-sync-get-dataset-items"

    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Queries Apify TikTok scraper for video results by search queries with retry handling."""
        if not self.api_token:
            logger.warning("APIFY_API_TOKEN is not configured; returning empty discovery list.")
            return []

        clean_keywords = [k.strip() for k in keywords if isinstance(k, str) and k.strip()]
        if not clean_keywords:
            return []

        cache_key = cache_service.build_key("tiktok_apify", ",".join(sorted(clean_keywords)))
        cached = cache_service.get(cache_key)
        if cached:
            logger.info("Serving %d cached TikTok creator records", len(cached))
            return cached

        payload = {
            "searchQueries": clean_keywords,
            "resultsPerPage": limit,
            "searchSection": "/video",
        }

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        attempts = max(1, settings.TIKTOK_RETRY_ATTEMPTS)
        backoff_base = settings.TIKTOK_RETRY_BACKOFF_BASE
        raw_items: List[Dict[str, Any]] = []

        start_time = time.time()
        logger.info(
            "Executing Apify TikTok scrape for %d queries (actor=%s)",
            len(clean_keywords),
            self.actor_id,
        )

        for attempt in range(1, attempts + 1):
            try:
                with httpx.Client(timeout=settings.TIKTOK_TIMEOUT) as client:
                    resp = client.post(self.base_url, json=payload, headers=headers)

                    if resp.status_code == 429:
                        raise ProviderRateLimitError(
                            "Apify TikTok scraper rate limit exceeded (HTTP 429). Please try again later.",
                            provider="ApifyTikTokProvider",
                            status_code=429,
                        )
                    if resp.status_code in (401, 403):
                        raise ProviderAuthenticationError(
                            f"Apify authentication failed (HTTP {resp.status_code}). Verify APIFY_API_TOKEN.",
                            provider="ApifyTikTokProvider",
                            status_code=resp.status_code,
                        )

                    resp.raise_for_status()
                    data = resp.json()
                    if isinstance(data, list):
                        raw_items = data
                    break

            except (ProviderRateLimitError, ProviderAuthenticationError):
                raise
            except httpx.TimeoutException:
                if attempt >= attempts:
                    raise ProviderTimeoutError(
                        f"Apify TikTok scraper timed out after {settings.TIKTOK_TIMEOUT}s.",
                        provider="ApifyTikTokProvider",
                    )
                sleep_sec = backoff_base ** (attempt - 1)
                logger.warning(
                    "Apify TikTok scraper attempt %d timed out; retrying in %.1fs...",
                    attempt,
                    sleep_sec,
                )
                time.sleep(sleep_sec)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    raise ProviderRateLimitError(
                        "Apify TikTok scraper rate limit exceeded (HTTP 429). Please try again later.",
                        provider="ApifyTikTokProvider",
                        status_code=429,
                    )
                if e.response.status_code in (401, 403):
                    raise ProviderAuthenticationError(
                        f"Apify authentication failed (HTTP {e.response.status_code}). Verify APIFY_API_TOKEN.",
                        provider="ApifyTikTokProvider",
                        status_code=e.response.status_code,
                    )
                if attempt >= attempts or e.response.status_code < 500:
                    raise ProviderError(
                        f"Apify scraper HTTP error: {e.response.status_code}",
                        provider="ApifyTikTokProvider",
                        status_code=e.response.status_code,
                    )
                sleep_sec = backoff_base ** (attempt - 1)
                logger.warning(
                    "Apify TikTok scraper attempt %d returned HTTP %s; retrying in %.1fs...",
                    attempt,
                    e.response.status_code,
                    sleep_sec,
                )
                time.sleep(sleep_sec)
            except Exception as e:
                if attempt >= attempts:
                    raise ProviderError(
                        f"Apify scraper execution failed: {str(e)}",
                        provider="ApifyTikTokProvider",
                    )
                sleep_sec = backoff_base ** (attempt - 1)
                logger.warning(
                    "Apify TikTok scraper attempt %d error: %s; retrying in %.1fs...",
                    attempt,
                    e,
                    sleep_sec,
                )
                time.sleep(sleep_sec)

        elapsed = time.time() - start_time
        logger.info(
            "Apify TikTok scraper completed in %.2fs: received %d raw items",
            elapsed,
            len(raw_items),
        )

        results: List[Dict[str, Any]] = []
        for item in raw_items:
            author = item.get("authorMeta") or {}
            username = author.get("name") or item.get("author") or "unknown_user"
            display_name = author.get("nickName") or username

            # Canonical profile URL validation - never fabricate merely because username exists
            raw_profile_url = author.get("profileUrl")
            profile_url = None
            is_profile_verified = False
            profile_status = "unavailable"

            if raw_profile_url and isinstance(raw_profile_url, str):
                cleaned_url = raw_profile_url.strip()
                if re.match(r"^https?://(?:www\.)?tiktok\.com/@[a-zA-Z0-9_.-]+/?$", cleaned_url):
                    profile_url = cleaned_url.rstrip("/")
                    is_profile_verified = True
                    profile_status = "verified"

            followers = author.get("fans")

            hashtags_raw = item.get("hashtags") or []
            hashtags: List[str] = []
            for h in hashtags_raw:
                if isinstance(h, dict) and "name" in h:
                    hashtags.append(str(h["name"]).strip().lstrip("#"))
                elif isinstance(h, str):
                    hashtags.append(h.strip().lstrip("#"))

            matched_query = item.get("query") or clean_keywords[0]
            default_vid_url = (
                f"{profile_url}/video/{item.get('id', '')}"
                if profile_url
                else f"https://www.tiktok.com/video/{item.get('id', '')}"
            )

            video_dict = {
                "video_id": str(item.get("id") or item.get("videoId") or ""),
                "video_url": item.get("webVideoUrl") or default_vid_url,
                "creator_username": username,
                "creator_display_name": display_name,
                "creator_bio": author.get("signature"),
                "creator_profile_url": profile_url,
                "creator_avatar_url": author.get("avatar") or author.get("avatarLarger") or author.get("avatarThumb"),
                "video_thumbnail_url": (item.get("videoMeta") or {}).get("coverUrl"),
                "is_profile_verified": is_profile_verified,
                "profile_status": profile_status,
                "follower_count": int(followers) if followers is not None else None,
                "views": item.get("playCount"),
                "likes": item.get("diggCount"),
                "comments": item.get("commentCount"),
                "shares": item.get("shareCount"),
                "saves": item.get("collectCount"),
                "hashtags": hashtags,
                "caption": item.get("text") or item.get("desc"),
                "created_at": item.get("createTimeISO"),
                "data_source": "apify",
                "is_demo_fixture": False,
                "provenance": "apify_tiktok_scraper",
                "matched_query": matched_query,
            }
            results.append(video_dict)

        cache_service.set(cache_key, results, ttl=settings.CACHE_TTL_SECONDS)
        return results

    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        """Fetches creator profile metadata via Apify scraper with caching."""
        if not self.api_token:
            logger.warning("APIFY_API_TOKEN is missing; returning empty profile details.")
            return {}

        clean_handle = handle.strip().lstrip("@")
        cache_key = cache_service.build_key("tiktok_profile", clean_handle)
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        payload = {
            "profiles": [clean_handle],
            "resultsPerPage": 1,
        }
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=settings.TIKTOK_TIMEOUT) as client:
                resp = client.post(self.base_url, json=payload, headers=headers)
                resp.raise_for_status()
                items = resp.json()
                if isinstance(items, list) and items:
                    data = items[0]
                    cache_service.set(cache_key, data, ttl=settings.CACHE_TTL_SECONDS)
                    return data
            return {}
        except Exception as e:
            logger.error("Apify profile lookup failed for %s: %s", clean_handle, e)
            return {}


def get_tiktok_provider() -> TikTokProvider:
    """Factory selecting provider based on DEMO_MODE and configured API tokens."""
    if settings.DEMO_MODE:
        return MockTikTokProvider()
    if settings.APIFY_API_TOKEN and settings.APIFY_API_TOKEN.strip():
        return ApifyTikTokProvider()
    return UnconfiguredTikTokProvider()
