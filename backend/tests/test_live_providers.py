import pytest
from unittest.mock import patch, MagicMock
import httpx
from core.config import settings
from services.provider_exceptions import (
    ProviderConfigurationError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderError,
)
from services.tiktok_provider import (
    ApifyTikTokProvider,
    UnconfiguredTikTokProvider,
    get_tiktok_provider,
)
from services.tiktok_discovery_service import tiktok_discovery_service
from schemas.kol import TikTokDiscoveryRequest


def test_unconfigured_tiktok_provider_raises_in_live_mode(monkeypatch):
    """In LIVE mode without APIFY_API_TOKEN, get_tiktok_provider returns UnconfiguredTikTokProvider which raises."""
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    monkeypatch.setattr(settings, "APIFY_API_TOKEN", None)

    provider = get_tiktok_provider()
    assert isinstance(provider, UnconfiguredTikTokProvider)

    with pytest.raises(ProviderConfigurationError) as exc_info:
        provider.discover_kols_by_keywords(["แชมพู"])

    assert "Live TikTok data provider is not configured" in str(exc_info.value)
    assert "APIFY_API_TOKEN" in str(exc_info.value)


def test_apify_tiktok_provider_retries_transient_error(monkeypatch):
    """ApifyTikTokProvider retries up to configured max attempts on transient 5xx or network errors."""
    provider = ApifyTikTokProvider(api_token="test_token_dummy")

    call_count = {"count": 0}

    def mock_post(*args, **kwargs):
        call_count["count"] += 1
        if call_count["count"] < 3:
            # Simulate transient 502 Bad Gateway
            mock_resp = MagicMock()
            mock_resp.status_code = 502
            raise httpx.HTTPStatusError("502 Bad Gateway", request=MagicMock(), response=mock_resp)
        # Succeeded on 3rd attempt
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [
            {
                "id": "vid123",
                "webVideoUrl": "https://www.tiktok.com/@somchai_thaifood/video/123",
                "authorMeta": {
                    "name": "somchai_thaifood",
                    "nickName": "Somchai Cooking",
                    "fans": 50000,
                },
                "playCount": 10000,
                "diggCount": 1500,
                "commentCount": 80,
                "shareCount": 45,
                "text": "ผัดกะเพราแท้สูตรโบราณ #อาหารไทย #streetfood",
                "createTime": 1700000000,
            }
        ]
        return mock_resp

    with patch("httpx.Client.post", side_effect=mock_post):
        # Speed up retry sleep during tests
        with patch("time.sleep", return_value=None):
            results = provider.discover_kols_by_keywords(["อาหารไทย"], limit=5)

    assert len(results) == 1
    assert call_count["count"] == 3
    assert results[0]["creator_username"] == "somchai_thaifood"


def test_apify_tiktok_provider_raises_rate_limit():
    """ApifyTikTokProvider translates 429 Too Many Requests into ProviderRateLimitError without endless retries."""
    provider = ApifyTikTokProvider(api_token="test_token_dummy")

    mock_resp = MagicMock()
    mock_resp.status_code = 429
    error_429 = httpx.HTTPStatusError("429 Too Many Requests", request=MagicMock(), response=mock_resp)

    with patch("httpx.Client.post", side_effect=error_429):
        with pytest.raises(ProviderRateLimitError) as exc_info:
            provider.discover_kols_by_keywords(["สกินแคร์"], limit=5)

    assert "rate limit" in str(exc_info.value).lower()


def test_apify_tiktok_provider_raises_timeout():
    """ApifyTikTokProvider catches request timeouts and raises clean ProviderTimeoutError."""
    provider = ApifyTikTokProvider(api_token="test_token_dummy")

    with patch("httpx.Client.post", side_effect=httpx.TimeoutException("Read timed out")):
        with patch("time.sleep", return_value=None):
            with pytest.raises(ProviderTimeoutError) as exc_info:
                provider.discover_kols_by_keywords(["สมุนไพร"], limit=5)

    assert "timed out" in str(exc_info.value).lower()


def test_live_discovery_endpoint_returns_503_when_unconfigured(client, monkeypatch):
    """POST /api/v1/tiktok/discover returns HTTP 503 with descriptive error when live provider lacks token."""
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    monkeypatch.setattr(settings, "APIFY_API_TOKEN", None)

    response = client.post(
        "/api/v1/tiktok/discover",
        json={"queries": ["organic skincare"], "max_results_per_query": 5},
    )

    assert response.status_code == 503
    assert "not configured" in response.json()["detail"].lower()


def test_profile_url_verification_canonical_check():
    """Validates that valid canonical URLs are marked verified while missing/invalid ones are marked unavailable."""
    from services.tiktok_discovery_service import normalize_tiktok_video

    valid_vid = normalize_tiktok_video(
        {
            "id": "1",
            "video_url": "https://www.tiktok.com/@good_user/video/1",
            "creator_username": "good_user",
            "profile_url": "https://www.tiktok.com/@good_user",
        }
    )
    assert valid_vid.is_profile_verified is True
    assert valid_vid.profile_status == "verified"

    invalid_vid = normalize_tiktok_video(
        {
            "id": "2",
            "video_url": "https://suspicious-phishing.com/@bad_user/video/2",
            "creator_username": "bad_user",
            "profile_url": "https://suspicious-phishing.com/@bad_user",
        }
    )
    assert invalid_vid.is_profile_verified is False
    assert invalid_vid.profile_status == "unavailable"
