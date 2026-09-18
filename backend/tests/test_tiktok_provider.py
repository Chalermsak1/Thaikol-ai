import pytest
from core.config import settings
from services.tiktok_provider import (
    MockTikTokProvider,
    ApifyTikTokProvider,
    get_tiktok_provider,
)


def test_mock_tiktok_provider_discovers_thai_creators():
    provider = MockTikTokProvider()
    results = provider.discover_kols_by_keywords(keywords=["สมุนไพร", "แชมพู"], limit=10)

    assert isinstance(results, list)
    assert len(results) > 0
    first = results[0]

    # Verify field structure
    assert "video_id" in first
    assert "video_url" in first
    assert "creator_username" in first
    assert "creator_display_name" in first
    assert "profile_url" in first or "creator_profile_url" in first
    assert "views" in first
    assert "likes" in first
    assert first["is_demo_fixture"] is True
    assert first["data_source"] == "demo_fixture"
    assert first["provenance"] == "curated_demo_fixture"


def test_mock_tiktok_provider_profile_details():
    provider = MockTikTokProvider()
    profile = provider.get_profile_details("mookda_skincare")

    assert profile != {}
    assert profile.get("tiktok_handle") == "mookda_skincare"
    assert "display_name" in profile
    assert profile.get("country") == "TH"

    # Profile lookup with leading @
    profile_at = provider.get_profile_details("@mookda_skincare")
    assert profile_at.get("tiktok_handle") == "mookda_skincare"

    # Unknown profile lookup
    unknown = provider.get_profile_details("nonexistent_creator_999999")
    assert unknown == {}


def test_mock_tiktok_provider_empty_or_fallback_keywords():
    provider = MockTikTokProvider()
    # Empty keywords list defaults to general demo candidates
    results = provider.discover_kols_by_keywords(keywords=[], limit=5)
    assert len(results) > 0


def test_apify_tiktok_provider_handles_missing_token_gracefully():
    provider = ApifyTikTokProvider(api_token=None)
    results = provider.discover_kols_by_keywords(keywords=["beauty"], limit=5)
    assert results == []

    profile = provider.get_profile_details("some_user")
    assert profile == {}


def test_get_tiktok_provider_factory():
    # In default DEMO_MODE, factory always returns MockTikTokProvider
    provider = get_tiktok_provider()
    assert isinstance(provider, MockTikTokProvider)
