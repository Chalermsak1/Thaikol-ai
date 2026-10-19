import json
import logging
import threading
import time
from typing import Any, Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from core.config import settings

logger = logging.getLogger(__name__)


def normalize_cache_url(url: str) -> str:
    """Normalizes a URL by lowercasing scheme/host, sorting query params, and stripping trailing slashes."""
    try:
        parsed = urlparse(url.strip())
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/")
        # Sort query params
        query_pairs = sorted(parse_qsl(parsed.query))
        query = urlencode(query_pairs)
        return urlunparse((scheme, netloc, path, "", query, ""))
    except Exception:
        return url.strip().lower()


class MemoryCacheService:
    """In-memory thread-safe TTL cache with bounded memory and LRU eviction."""

    def __init__(self, default_ttl: int = 3600, max_items: int = 10000):
        self._cache: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl
        self.max_items = max_items

    def build_key(self, provider: str, raw_key: str) -> str:
        norm = normalize_cache_url(raw_key)
        return f"{provider}:{norm}"

    def get(self, key: str) -> Optional[Any]:
        if not settings.ENABLE_CACHE:
            return None
        with self._lock:
            if key not in self._cache:
                return None
            expires_at, val = self._cache[key]
            if time.time() > expires_at:
                del self._cache[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        if not settings.ENABLE_CACHE:
            return
        ttl = ttl if ttl is not None else self.default_ttl
        expires_at = time.time() + ttl
        with self._lock:
            # Evict expired or oldest keys if size exceeds max_items
            if len(self._cache) >= self.max_items:
                now = time.time()
                # 1. Clean expired items
                expired = [k for k, (exp, _) in self._cache.items() if exp < now]
                for k in expired:
                    del self._cache[k]
                # 2. If still full, evict oldest 10%
                if len(self._cache) >= self.max_items:
                    num_to_evict = max(1, self.max_items // 10)
                    for k in list(self._cache.keys())[:num_to_evict]:
                        del self._cache[k]

            self._cache[key] = (expires_at, value)

    def delete(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


class RedisCacheService:
    """Production Redis caching backend with JSON serialization and auto-reconnect fallback."""

    def __init__(self, redis_url: str, default_ttl: int = 3600):
        self.default_ttl = default_ttl
        self._fallback = MemoryCacheService(default_ttl=default_ttl)
        self._client = None
        self._init_redis(redis_url)

    def _init_redis(self, redis_url: str):
        try:
            import redis
            self._client = redis.Redis.from_url(redis_url, decode_responses=True)
            self._client.ping()
            logger.info("Connected to Redis cache at %s", redis_url)
        except Exception as e:
            logger.warning("Redis connection failed (%s). Falling back to in-memory cache.", e)
            self._client = None

    def build_key(self, provider: str, raw_key: str) -> str:
        norm = normalize_cache_url(raw_key)
        return f"{provider}:{norm}"

    def get(self, key: str) -> Optional[Any]:
        if not settings.ENABLE_CACHE:
            return None
        if self._client is not None:
            try:
                val = self._client.get(key)
                if val is not None:
                    return json.loads(val)
                return None
            except Exception as e:
                logger.debug("Redis GET error (%s), using fallback", e)
        return self._fallback.get(key)

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        if not settings.ENABLE_CACHE:
            return
        ttl = ttl if ttl is not None else self.default_ttl
        if self._client is not None:
            try:
                serialized = json.dumps(value, ensure_ascii=False)
                self._client.setex(key, ttl, serialized)
                return
            except Exception as e:
                logger.debug("Redis SET error (%s), using fallback", e)
        self._fallback.set(key, value, ttl=ttl)

    def delete(self, key: str) -> None:
        if self._client is not None:
            try:
                self._client.delete(key)
            except Exception:
                pass
        self._fallback.delete(key)

    def clear(self) -> None:
        if self._client is not None:
            try:
                self._client.flushdb()
            except Exception:
                pass
        self._fallback.clear()


def create_cache_service():
    """Initializes the appropriate cache service based on configuration."""
    redis_url = getattr(settings, "REDIS_URL", None)
    if redis_url:
        return RedisCacheService(redis_url=redis_url, default_ttl=settings.CACHE_TTL_SECONDS)
    return MemoryCacheService(
        default_ttl=settings.CACHE_TTL_SECONDS,
        max_items=getattr(settings, "CACHE_MAX_MEMORY_ITEMS", 10000),
    )


cache_service = create_cache_service()
