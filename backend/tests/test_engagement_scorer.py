from schemas.kol import KOLCandidate
from services.engagement_scorer import (
    calculate_pool_engagement_scores,
    calculate_single_engagement_score,
)


def _make_candidate(username: str, er: float, views: float, followers: int) -> KOLCandidate:
    return KOLCandidate(
        username=username,
        normalized_username=username.lower(),
        display_name=f"Creator {username}",
        profile_url=f"https://www.tiktok.com/@{username}",
        follower_count=followers,
        sample_video_count=2,
        average_views=views,
        average_likes=views * er,
        average_comments=10.0,
        average_shares=5.0,
        estimated_engagement_rate=er,
        collected_at="2026-09-17T20:00:00Z",
    )


def test_engagement_scorer_relative_percentiles():
    # 3 creators with different engagement and reach metrics
    c1 = _make_candidate("top_eng", er=0.08, views=50000.0, followers=100000)
    c2 = _make_candidate("mid_eng", er=0.03, views=20000.0, followers=100000)
    c3 = _make_candidate("low_eng", er=0.01, views=5000.0, followers=100000)

    pool = [c1, c2, c3]
    scores = calculate_pool_engagement_scores(pool)

    assert scores["top_eng"] > scores["mid_eng"] > scores["low_eng"]
    assert 0.0 <= scores["top_eng"] <= 100.0
    assert 0.0 <= scores["low_eng"] <= 100.0


def test_engagement_scorer_missing_follower_count_redistributes_weights():
    # c_no_fol has no follower count (None)
    c_no_fol = KOLCandidate(
        username="no_follower_kol",
        normalized_username="no_follower_kol",
        display_name="No Follower KOL",
        profile_url="https://www.tiktok.com/@no_follower_kol",
        follower_count=None,
        sample_video_count=2,
        average_views=30000.0,
        average_likes=1500.0,
        average_comments=50.0,
        average_shares=20.0,
        estimated_engagement_rate=0.05,
        collected_at="2026-09-17T20:00:00Z",
    )
    c_normal = _make_candidate("normal_kol", er=0.02, views=10000.0, followers=50000)

    scores = calculate_pool_engagement_scores([c_no_fol, c_normal])
    assert "no_follower_kol" in scores
    assert "normal_kol" in scores
    # c_no_fol has higher ER (0.05 vs 0.02), so should score higher despite missing follower count
    assert scores["no_follower_kol"] > scores["normal_kol"]


def test_engagement_scorer_all_metrics_none():
    c_empty = KOLCandidate(
        username="empty_kol",
        normalized_username="empty_kol",
        display_name="Empty KOL",
        profile_url="https://www.tiktok.com/@empty_kol",
        follower_count=None,
        sample_video_count=0,
        average_views=None,
        average_likes=None,
        average_comments=None,
        average_shares=None,
        estimated_engagement_rate=None,
        collected_at="2026-09-17T20:00:00Z",
    )
    scores = calculate_pool_engagement_scores([c_empty])
    assert scores["empty_kol"] == 50.0  # Neutral baseline


def test_engagement_scorer_single_candidate_graceful():
    c = _make_candidate("solo_kol", er=0.04, views=15000.0, followers=80000)
    score = calculate_single_engagement_score(c)
    assert 0.0 <= score <= 100.0
