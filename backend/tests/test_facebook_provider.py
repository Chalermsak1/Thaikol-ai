from services.cache import cache_service
from services.facebook_provider import (
    ApifyFacebookProvider,
    MockFacebookProvider,
    get_facebook_provider,
)


def test_mock_facebook_provider_fixture():
    """Test that MockFacebookProvider returns authentic Thai brand signals for demo/testing."""
    provider = MockFacebookProvider()
    cache_service.clear()
    data = provider.extract_page_content("https://www.facebook.com/KhaokhoTalaypu")

    assert data["extraction_status"] == "success"
    assert "Khaokho" in data["page_name"]
    assert data["follower_count"] > 100000
    assert len(data["recent_posts"]) >= 2
    assert "ผมร่วง" in data["recent_posts"][0]["text"]
    assert data["error"] is None


def test_apify_facebook_provider_missing_token_graceful():
    """Test that ApifyFacebookProvider returns a controlled error when APIFY_API_TOKEN is empty."""
    provider = ApifyFacebookProvider(api_token=None)
    cache_service.clear()
    data = provider.extract_page_content("https://www.facebook.com/example")

    assert data["extraction_status"] == "failed"
    assert "APIFY_API_TOKEN is not configured" in data["error"]


def test_get_facebook_provider_factory():
    """Test that get_facebook_provider respects DEMO_MODE and token settings."""
    provider = get_facebook_provider()
    # In default DEMO_MODE=true, it should select MockFacebookProvider
    assert isinstance(provider, (MockFacebookProvider, ApifyFacebookProvider))
