import threading
import time
from typing import Any, Optional
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from core.config import settings


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
    """In-memory thread-safe TTL cache for provider extractions."""

    def __init__(self, default_ttl: int = 3600):
        self._cache: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self.default_ttl = default_ttl

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
            self._cache[key] = (expires_at, value)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


cache_service = MemoryCacheService(default_ttl=settings.CACHE_TTL_SECONDS)
