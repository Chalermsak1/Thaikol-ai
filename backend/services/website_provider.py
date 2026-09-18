import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bs4 import BeautifulSoup
import httpx

from core.config import settings
from core.logging import logger
from schemas.brand import WebsiteContent
from .cache import cache_service
from .interfaces import WebsiteProvider
from .security import validate_safe_url


class ProductionWebsiteProvider(WebsiteProvider):
    """Production-grade website content extractor with SSRF defense, size limits, and noise removal."""

    def __init__(
        self,
        timeout: Optional[float] = None,
        max_size: Optional[int] = None,
        max_text_len: Optional[int] = None,
    ):
        self.timeout = timeout or settings.WEBSITE_EXTRACT_TIMEOUT
        self.max_size = max_size or settings.WEBSITE_MAX_RESPONSE_SIZE
        self.max_text_len = max_text_len or settings.WEBSITE_MAX_TEXT_LENGTH

    def extract_brand_content(self, url: str) -> Dict[str, Any]:
        """Extracts brand signals from a public website URL safely."""
        extracted_at = datetime.now(timezone.utc).isoformat()

        # 1. URL validation & SSRF defense
        try:
            safe_url = validate_safe_url(url)
        except Exception as err:
            logger.warning("Website URL security check failed for '%s': %s", url, err)
            return WebsiteContent(
                final_url=url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error=f"Security/Validation error: {err}",
            ).model_dump()

        # 2. Check Cache
        cache_key = cache_service.build_key("website", safe_url)
        cached = cache_service.get(cache_key)
        if cached:
            logger.debug("Serving cached website content for: %s", safe_url)
            return cached

        # 3. HTTP Request with size and redirect protections
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/128.0.0.0 Safari/537.36 (compatible; ThaiKOLBot/1.0)"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "th,en-US;q=0.9,en;q=0.8",
        }

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                with client.stream("GET", safe_url, headers=headers) as resp:
                    resp.raise_for_status()

                    # Verify redirected URL hasn't bounced to an unsafe address
                    final_url = str(resp.url)
                    validate_safe_url(final_url)

                    # Check Content-Length if present
                    content_length = resp.headers.get("content-length")
                    if content_length and int(content_length) > self.max_size:
                        raise ValueError(
                            f"Page response size ({content_length} bytes) exceeds limit ({self.max_size} bytes)"
                        )

                    # Stream download and enforce size limit
                    chunks: List[bytes] = []
                    total_bytes = 0
                    for chunk in resp.iter_bytes():
                        total_bytes += len(chunk)
                        if total_bytes > self.max_size:
                            raise ValueError(f"Downloaded content exceeded {self.max_size} bytes limit")
                        chunks.append(chunk)

                    raw_bytes = b"".join(chunks)
                    # Decode text safely
                    encoding = resp.encoding or "utf-8"
                    html_content = raw_bytes.decode(encoding, errors="replace")

        except httpx.TimeoutException:
            logger.warning("Website extraction timed out for '%s'", safe_url)
            return WebsiteContent(
                final_url=safe_url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error=f"Connection timed out after {self.timeout}s",
            ).model_dump()
        except Exception as err:
            logger.warning("Website extraction failed for '%s': %s", safe_url, err)
            return WebsiteContent(
                final_url=safe_url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error=f"Failed to retrieve website: {str(err)}",
            ).model_dump()

        # 4. HTML Parsing & Feature Extraction
        try:
            content = self._parse_html(html_content, final_url, extracted_at)
            # Store in cache
            cache_service.set(cache_key, content.model_dump())
            return content.model_dump()
        except Exception as err:
            logger.error("HTML parsing error for '%s': %s", final_url, err)
            return WebsiteContent(
                final_url=final_url,
                extracted_at=extracted_at,
                extraction_status="failed",
                error=f"Failed to parse page HTML: {str(err)}",
            ).model_dump()

    def _parse_html(self, html_text: str, final_url: str, extracted_at: str) -> WebsiteContent:
        try:
            soup = BeautifulSoup(html_text, "lxml")
        except Exception:
            soup = BeautifulSoup(html_text, "html.parser")

        # Page Title
        page_title = None
        if soup.title and soup.title.string:
            page_title = soup.title.string.strip()

        # Meta description
        meta_desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
        meta_description = meta_desc_tag.get("content", "").strip() if meta_desc_tag else None

        # Canonical URL
        canon_tag = soup.find("link", attrs={"rel": "canonical"})
        canonical_url = canon_tag.get("href", "").strip() if canon_tag else None

        # OpenGraph metadata
        og_title_tag = soup.find("meta", attrs={"property": "og:title"})
        og_title = og_title_tag.get("content", "").strip() if og_title_tag else None

        og_desc_tag = soup.find("meta", attrs={"property": "og:description"})
        og_description = og_desc_tag.get("content", "").strip() if og_desc_tag else None

        # Headings (H1, H2, H3)
        headings: List[str] = []
        for tag in soup.find_all(["h1", "h2", "h3"]):
            text = tag.get_text(strip=True)
            if text and len(text) > 2 and text not in headings:
                headings.append(text)
        headings = headings[:25]  # limit to top 25 headings

        # Remove noisy elements
        for element in soup(["script", "style", "noscript", "svg", "canvas", "header", "footer", "nav", "aside"]):
            element.decompose()

        # Extract visible body text
        raw_text = soup.get_text(separator=" ", strip=True)
        # Condense consecutive whitespaces
        cleaned_text = re.sub(r"\s+", " ", raw_text).strip()
        if len(cleaned_text) > self.max_text_len:
            cleaned_text = cleaned_text[: self.max_text_len] + "... [truncated]"

        return WebsiteContent(
            final_url=final_url,
            page_title=page_title,
            meta_description=meta_description,
            canonical_url=canonical_url,
            og_title=og_title,
            og_description=og_description,
            headings=headings,
            visible_text=cleaned_text,
            extracted_at=extracted_at,
            extraction_status="success",
            error=None,
        )
