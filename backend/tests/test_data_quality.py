from schemas.kol import KOLCandidate
from services.data_quality_service import data_quality_service


def test_data_quality_full_candidate():
    c = KOLCandidate(
        username="complete_kol",
        normalized_username="complete_kol",
        display_name="Complete Creator",
        profile_url="https://www.tiktok.com/@complete_kol",
        bio="Full bio text here",
        follower_count=120000,
        sample_video_count=3,
        sample_captions=["Caption 1", "Caption 2"],
        hashtags=["haircare", "beauty"],
        average_views=30000.0,
        average_likes=1500.0,
        estimated_engagement_rate=0.035,
        thai_language_ratio=0.85,
        local_signal_score=0.75,
        collected_at="2026-09-17T20:00:00Z",
    )
    score = data_quality_service.evaluate_candidate(c)
    assert score == 100.0


def test_data_quality_partial_candidate():
    c = KOLCandidate(
        username="partial_kol",
        normalized_username="partial_kol",
        display_name="Partial Creator",
        profile_url="https://www.tiktok.com/@partial_kol",
        bio=None,  # Missing bio
        follower_count=None,  # Missing follower count
        sample_video_count=1,
        sample_captions=["Just one caption"],
        hashtags=[],  # Missing hashtags
        average_views=None,
        average_likes=None,
        thai_language_ratio=0.9,
        local_signal_score=0.5,
        collected_at="2026-09-17T20:00:00Z",
    )
    score = data_quality_service.evaluate_candidate(c)
    assert 30.0 <= score <= 70.0


def test_data_quality_empty_candidate():
    c = KOLCandidate(
        username="sparse_kol",
        normalized_username="sparse_kol",
        display_name="Sparse",
        profile_url="",
        bio=None,
        follower_count=None,
        sample_video_count=0,
        sample_captions=[],
        hashtags=[],
        thai_language_ratio=0.0,
        local_signal_score=0.0,
        collected_at="2026-09-17T20:00:00Z",
    )
    score = data_quality_service.evaluate_candidate(c)
    assert score == 0.0
