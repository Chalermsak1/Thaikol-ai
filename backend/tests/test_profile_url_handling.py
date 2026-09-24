import json
import os
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from services.kol_scorer import multi_factor_kol_scorer
from services.tiktok_discovery_service import normalize_tiktok_video
from services.tiktok_provider import MockTikTokProvider


def test_profile_url_valid_verified_is_clickable():
    """Valid profile URL from a verified live creator should be marked verified and available."""
    raw = {
        "id": "live_vid_001",
        "video_url": "https://www.tiktok.com/@somchai_real/video/789",
        "creator_username": "somchai_real",
        "creator_display_name": "Somchai Real",
        "creator_profile_url": "https://www.tiktok.com/@somchai_real",
        "is_profile_verified": True,
        "is_demo_fixture": False,
        "provenance": "apify_tiktok_scraper",
    }
    norm = normalize_tiktok_video(raw)

    assert norm.creator_profile_url == "https://www.tiktok.com/@somchai_real"
    assert norm.is_profile_verified is True
    assert norm.profile_status == "verified"
    assert norm.is_demo_fixture is False

    # Score candidate
    candidate = KOLCandidate(
        username=norm.creator_username,
        normalized_username=norm.creator_username.lower(),
        display_name=norm.creator_display_name,
        profile_url=norm.creator_profile_url,
        is_profile_verified=norm.is_profile_verified,
        profile_status=norm.profile_status,
        follower_count=50000,
        sample_video_count=1,
        average_views=10000.0,
        average_likes=500.0,
        estimated_engagement_rate=0.04,
        thai_language_ratio=0.8,
        local_signal_score=0.7,
        data_source="live",
        collected_at="2026-09-18T00:00:00Z",
        is_demo_fixture=False,
        provenance="apify_tiktok_scraper",
    )

    brand = BrandProfile(
        brand_name="Test Brand",
        industry="Beauty",
        products_services=["Skincare"],
        target_audience=["Adults"],
        content_themes=["beauty"],
        brand_tone=["friendly"],
        thailand_focus=True,
    )

    recs = multi_factor_kol_scorer.score_and_rank_candidates(brand_profile=brand, candidates=[candidate])
    assert len(recs) == 1
    rec = recs[0]
    assert rec.profile_url == "https://www.tiktok.com/@somchai_real"
    assert rec.is_profile_verified is True
    assert rec.profile_status == "verified"
    assert rec.is_demo_fixture is False


def test_profile_url_missing_or_empty_is_non_clickable():
    """Missing or unavailable profile URL must NOT be fabricated from username alone."""
    raw = {
        "id": "vid_no_url",
        "author": "mystery_creator",
        "video_url": "https://cdn.example.com/video123.mp4",
        # Notice: creator_profile_url and profile_url are omitted entirely!
        "is_demo_fixture": False,
        "provenance": "raw_upload",
    }
    norm = normalize_tiktok_video(raw)

    # Rule 6: Do not generate a new profile URL from username merely because username exists
    assert norm.creator_profile_url is None
    assert norm.is_profile_verified is False
    assert norm.profile_status == "unavailable"

    # Score candidate with missing profile_url
    candidate = KOLCandidate(
        username=norm.creator_username,
        normalized_username=norm.creator_username.lower(),
        display_name=norm.creator_display_name,
        profile_url=norm.creator_profile_url,
        is_profile_verified=norm.is_profile_verified,
        profile_status=norm.profile_status,
        follower_count=20000,
        sample_video_count=1,
        average_views=5000.0,
        average_likes=200.0,
        estimated_engagement_rate=0.03,
        thai_language_ratio=0.8,
        local_signal_score=0.6,
        data_source="live",
        collected_at="2026-09-18T00:00:00Z",
        is_demo_fixture=False,
        provenance="raw_upload",
    )

    brand = BrandProfile(
        brand_name="Test Brand",
        industry="Lifestyle",
        products_services=["Wellness"],
        target_audience=["Adults"],
        content_themes=["lifestyle"],
        brand_tone=["friendly"],
        thailand_focus=True,
    )

    recs = multi_factor_kol_scorer.score_and_rank_candidates(brand_profile=brand, candidates=[candidate])
    assert len(recs) == 1
    rec = recs[0]
    assert rec.profile_url is None
    assert rec.is_profile_verified is False
    assert rec.profile_status == "unavailable"


def test_profile_url_demo_fixture_labeled_as_demo_unavailable():
    """Demo creators from fixtures must be clearly marked as demo and unverified/unavailable."""
    provider = MockTikTokProvider()
    results = provider.discover_kols_by_keywords(keywords=["general"], limit=5)
    assert len(results) > 0

    first = results[0]
    assert first["is_demo_fixture"] is True
    assert first["provenance"] == "curated_demo_fixture"
    assert first["is_profile_verified"] is False
    assert first["profile_status"] == "unavailable"

    norm = normalize_tiktok_video(first)
    assert norm.is_demo_fixture is True
    assert norm.provenance == "curated_demo_fixture"
    assert norm.is_profile_verified is False
    assert norm.profile_status == "unavailable"


def test_sample_kols_fixture_audit_integrity():
    """Audit test verifying that all records in sample_kols.json are explicitly marked demo and unverified."""
    fixture_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "fixtures", "sample_kols.json")
    with open(fixture_path, "r", encoding="utf-8") as f:
        kols = json.load(f)

    assert len(kols) == 11

    for kol in kols:
        # All fixture creators must retain demo provenance
        assert kol.get("is_demo_fixture") is True
        assert kol.get("provenance") == "curated_demo_fixture"
        assert kol.get("data_source") == "demo_fixture"

        # Explicit handling: Must NOT claim any creator is real/verified
        assert kol.get("is_profile_verified") is False
        assert kol.get("profile_status") == "unavailable"
        assert "unverified" in kol.get("disclaimer", "").lower()
