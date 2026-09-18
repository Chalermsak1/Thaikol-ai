import pytest
from services.tiktok_discovery_service import normalize_tiktok_video, _safe_int
from schemas.kol import TikTokVideo


def test_safe_int_conversion():
    assert _safe_int(100) == 100
    assert _safe_int("250") == 250
    assert _safe_int("350.0") == 350
    assert _safe_int(None) is None
    assert _safe_int("invalid_number") is None
    assert _safe_int("") is None
    assert _safe_int(-50) is None  # negative numbers rejected for counts


def test_normalize_tiktok_video_safe_nulls():
    """Missing metric fields must remain None and NEVER be fabricated into fake numbers."""
    raw = {
        "video_id": "vid_test_01",
        "video_url": "https://www.tiktok.com/@somchai/video/123",
        "creator_username": "@somchai",
        "creator_display_name": "Somchai Herbal",
        "caption": "รีวิวสมุนไพรไทย #herbal #ไทย",
        # Explicitly omit views, likes, comments, shares, saves, follower_count
    }

    norm = normalize_tiktok_video(raw)

    assert isinstance(norm, TikTokVideo)
    assert norm.video_id == "vid_test_01"
    assert norm.creator_username == "somchai"  # Stripped @
    assert norm.views is None
    assert norm.likes is None
    assert norm.comments is None
    assert norm.shares is None
    assert norm.saves is None
    assert norm.follower_count is None
    assert norm.data_source == "live"


def test_normalize_tiktok_video_hashtag_cleaning():
    raw = {
        "video_id": "vid_test_02",
        "creator_username": "beauty_guru",
        "caption": "Testing tags",
        "hashtags": ["#skincare", "สมุนไพร", {"name": "#organic"}, {"name": "beauty"}],
        "views": "15000",
        "likes": 1200,
        "follower_count": 80000,
    }

    norm = normalize_tiktok_video(raw)

    assert norm.views == 15000
    assert norm.likes == 1200
    assert norm.follower_count == 80000
    assert norm.hashtags == ["skincare", "สมุนไพร", "organic", "beauty"]


def test_normalize_tiktok_video_defaults_and_provenance():
    raw = {
        "id": "apify_vid_99",
        "webVideoUrl": "https://www.tiktok.com/@pattaya_travel/video/99",
        "author": "pattaya_travel",
        "data_source": "apify",
        "is_demo_fixture": False,
        "provenance": "apify_tiktok_scraper",
    }

    norm = normalize_tiktok_video(raw)

    assert norm.video_id == "apify_vid_99"
    assert norm.video_url == "https://www.tiktok.com/@pattaya_travel/video/99"
    assert norm.creator_username == "pattaya_travel"
    assert norm.creator_profile_url == "https://www.tiktok.com/@pattaya_travel"
    assert norm.data_source == "apify"
    assert norm.is_demo_fixture is False
    assert norm.provenance == "apify_tiktok_scraper"
