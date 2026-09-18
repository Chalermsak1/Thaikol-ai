import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from core.config import settings
from core.logging import logger
from .cache import cache_service
from .interfaces import TikTokProvider


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
    """Deterministic, offline mock provider for Phase 2 demonstration and tests.

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

        # Check handle, display name, category, bio
        handle = (creator.get("tiktok_handle") or "").lower()
        name = (creator.get("display_name") or "").lower()
        cat = (creator.get("category") or "").lower()
        bio = (creator.get("bio") or "").lower()

        if q in handle or q in name or q in cat or q in bio:
            return True

        # Check content tags
        tags = [t.lower() for t in creator.get("content_tags", []) if isinstance(t, str)]
        if any(q in t for t in tags):
            return True

        # Check recent captions
        captions = [c.lower() for c in creator.get("recent_captions", []) if isinstance(c, str)]
        if any(q in c for c in captions):
            return True

        # Check sample videos captions & hashtags
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

        # If no keywords provided, default to all fixture creators
        if not clean_keywords:
            clean_keywords = ["general"]

        for query in clean_keywords:
            matched_creators = [
                c for c in fixtures if self._creator_matches_query(c, query)
            ]

            # If user query matched creators in the fixture
            target_creators = matched_creators
            # If nothing matched and query is general/demo fallback, include all
            if not target_creators and any(
                term in query.lower() for term in ["hair", "skin", "shampoo", "สมุนไพร", "ผม", "ผิว", "organic", "beauty"]
            ):
                target_creators = fixtures

            for creator in target_creators:
                handle = creator.get("tiktok_handle") or "unknown_user"
                display_name = creator.get("display_name") or handle
                profile_url = creator.get("profile_url") or f"https://www.tiktok.com/@{handle}"
                bio = creator.get("bio")
                followers = (creator.get("metrics") or {}).get("followers") or creator.get("follower_count")

                sample_videos = creator.get("sample_videos") or []
                if not sample_videos:
                    # Synthesize sample video if none exists in fixture
                    sample_videos = [
                        {
                            "video_id": f"vid_{handle}_01",
                            "video_url": f"{profile_url}/video/7000000000001",
                            "caption": creator.get("recent_captions", [""])[0] if creator.get("recent_captions") else bio,
                            "views": (creator.get("metrics") or {}).get("avg_views", 10000),
                            "likes": int(((creator.get("metrics") or {}).get("avg_views", 10000)) * 0.05),
                            "comments": int(((creator.get("metrics") or {}).get("avg_views", 10000)) * 0.003),
                            "shares": int(((creator.get("metrics") or {}).get("avg_views", 10000)) * 0.002),
                            "saves": int(((creator.get("metrics") or {}).get("avg_views", 10000)) * 0.005),
                            "hashtags": creator.get("content_tags", []),
                            "created_at": "2026-09-01T00:00:00Z",
                        }
                    ]

                for vid in sample_videos:
                    results.append(
                        {
                            "video_id": vid.get("video_id") or f"vid_{handle}_{hash(vid.get('caption', '')) % 10000}",
                            "video_url": vid.get("video_url") or f"{profile_url}/video/default",
                            "creator_username": handle,
                            "creator_display_name": display_name,
                            "creator_bio": bio,
                            "creator_profile_url": profile_url,
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

        # Truncate to limit if exceeded
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


class ApifyTikTokProvider(TikTokProvider):
    """Production provider integrating Apify's TikTok Scraper (clockworks/tiktok-scraper)."""

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or settings.APIFY_API_TOKEN
        self.actor_id = settings.APIFY_TIKTOK_ACTOR_ID.replace("/", "~")
        self.base_url = f"https://api.apify.com/v2/acts/{self.actor_id}/run-sync-get-dataset-items"

    def discover_kols_by_keywords(
        self, keywords: List[str], limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Queries Apify TikTok scraper for video results by search queries."""
        if not self.api_token:
            logger.warning("Apify TikTok scraper called without APIFY_API_TOKEN.")
            return []

        clean_keywords = [k.strip() for k in keywords if isinstance(k, str) and k.strip()]
        if not clean_keywords:
            return []

        cache_key = cache_service.build_key("tiktok_apify", ",".join(sorted(clean_keywords)))
        cached = cache_service.get(cache_key)
        if cached:
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

        try:
            logger.info("Executing Apify TikTok scrape for %d queries", len(clean_keywords))
            with httpx.Client(timeout=settings.TIKTOK_TIMEOUT) as client:
                resp = client.post(self.base_url, json=payload, headers=headers)
                resp.raise_for_status()
                raw_items = resp.json()

            if not isinstance(raw_items, list):
                logger.warning("Unexpected Apify TikTok scraper response format: %s", type(raw_items))
                return []

            results: List[Dict[str, Any]] = []
            for item in raw_items:
                author = item.get("authorMeta") or {}
                username = author.get("name") or item.get("author") or "unknown_user"
                display_name = author.get("nickName") or username
                profile_url = author.get("profileUrl") or f"https://www.tiktok.com/@{username}"
                followers = author.get("fans")

                hashtags_raw = item.get("hashtags") or []
                hashtags: List[str] = []
                for h in hashtags_raw:
                    if isinstance(h, dict) and "name" in h:
                        hashtags.append(h["name"])
                    elif isinstance(h, str):
                        hashtags.append(h.lstrip("#"))

                # Tag matched query if available in result
                matched_query = item.get("query") or clean_keywords[0]

                video_dict = {
                    "video_id": str(item.get("id") or item.get("videoId") or ""),
                    "video_url": item.get("webVideoUrl") or f"{profile_url}/video/{item.get('id', '')}",
                    "creator_username": username,
                    "creator_display_name": display_name,
                    "creator_bio": author.get("signature"),
                    "creator_profile_url": profile_url,
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

        except httpx.HTTPStatusError as e:
            logger.error("Apify TikTok scraper HTTP %s error: %s", e.response.status_code, e.response.text[:200])
            return []
        except Exception as e:
            logger.error("Apify TikTok scraper error: %s", e)
            return []

    def get_profile_details(self, handle: str) -> Dict[str, Any]:
        """Fetches creator profile metadata via Apify scraper."""
        if not self.api_token:
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
    """Factory selecting ApifyTikTokProvider if token is configured and not in DEMO_MODE;

    otherwise MockTikTokProvider for reliable offline demoing.
    """
    if not settings.DEMO_MODE and settings.APIFY_API_TOKEN:
        return ApifyTikTokProvider()
    return MockTikTokProvider()
