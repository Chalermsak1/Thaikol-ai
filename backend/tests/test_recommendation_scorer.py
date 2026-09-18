from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from schemas.matching import SemanticMatchResult
from services.kol_scorer import multi_factor_kol_scorer


def test_multifactor_kol_scorer_ranking_and_breakdown():
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Haircare",
        keywords=["แชมพูสมุนไพร"],
        summary="Herbal haircare",
    )

    c1 = KOLCandidate(
        username="best_kol",
        normalized_username="best_kol",
        display_name="Best KOL",
        profile_url="https://www.tiktok.com/@best_kol",
        follower_count=100000,
        sample_video_count=3,
        sample_captions=["แชมพูสมุนไพรลดผมร่วง"],
        hashtags=["แชมพูสมุนไพร"],
        average_views=50000.0,
        average_likes=2500.0,
        estimated_engagement_rate=0.05,
        local_signal_score=0.8,
        thai_language_ratio=0.9,
        collected_at="2026-09-17T20:00:00Z",
    )
    c2 = KOLCandidate(
        username="mid_kol",
        normalized_username="mid_kol",
        display_name="Mid KOL",
        profile_url="https://www.tiktok.com/@mid_kol",
        follower_count=50000,
        sample_video_count=2,
        sample_captions=["รีวิวของใช้ทั่วไป"],
        hashtags=["รีวิว"],
        average_views=10000.0,
        average_likes=300.0,
        estimated_engagement_rate=0.01,
        local_signal_score=0.4,
        thai_language_ratio=0.5,
        collected_at="2026-09-17T20:00:00Z",
    )

    # Provide mocked semantic results
    sem_results = [
        SemanticMatchResult(
            username="best_kol",
            display_name="Best KOL",
            profile_url="https://www.tiktok.com/@best_kol",
            semantic_relevance_score=85.0,
            cosine_similarity=0.70,
            matching_topics=["แชมพูสมุนไพร"],
        ),
        SemanticMatchResult(
            username="mid_kol",
            display_name="Mid KOL",
            profile_url="https://www.tiktok.com/@mid_kol",
            semantic_relevance_score=50.0,
            cosine_similarity=0.0,
            matching_topics=[],
        ),
    ]

    recs = multi_factor_kol_scorer.score_and_rank_candidates(
        brand_profile=brand,
        candidates=[c1, c2],
        semantic_results=sem_results,
    )

    assert len(recs) == 2
    assert recs[0].username == "best_kol"
    assert recs[0].rank == 1
    assert recs[1].username == "mid_kol"
    assert recs[1].rank == 2
    assert recs[0].final_score > recs[1].final_score

    # Check breakdown mathematical consistency
    b = recs[0].score_breakdown
    expected_sum = round(
        b.semantic_relevance.weighted_contribution
        + b.engagement_quality.weighted_contribution
        + b.local_content_relevance.weighted_contribution
        + b.brand_safety.weighted_contribution
        + b.data_quality.weighted_contribution,
        1,
    )
    assert abs(recs[0].final_score - expected_sum) <= 0.2


def test_multifactor_kol_scorer_score_kol_abstract_interface():
    res = multi_factor_kol_scorer.score_kol(
        semantic_similarity=80.0,
        metrics={
            "engagement_quality_score": 70.0,
            "local_content_relevance_score": 60.0,
            "brand_safety_score": 100.0,
            "data_quality_score": 90.0,
        },
    )
    assert "final_score" in res
    assert 0.0 <= res["final_score"] <= 100.0


def test_exact_formula_and_known_example_calculation():
    """Validates the exact known example required by the Phase 4 specification:

    Semantic = 88.4 (weight 0.45) -> 39.78
    Engagement = 81.2 (weight 0.25) -> 20.30
    Local = 85.0 (weight 0.15) -> 12.75
    Safety = 100.0 (weight 0.10) -> 10.00
    Data = 100.0 (weight 0.05) -> 5.00
    Total sum = 87.83 -> rounds to 87.8
    """
    res = multi_factor_kol_scorer.score_kol(
        semantic_similarity=88.4,
        metrics={
            "engagement_quality_score": 81.2,
            "local_content_relevance_score": 85.0,
            "brand_safety_score": 100.0,
            "data_quality_score": 100.0,
        },
    )
    assert res["final_score"] == 87.8


def test_audience_fit_proxy_does_not_leak_into_final_score():
    """Proves that Audience Fit Proxy is strictly an informational supporting signal

    and does NOT alter or contaminate the 5-factor Final Score.
    """
    brand = BrandProfile(
        brand_name="Test Brand",
        industry="Beauty",
        keywords=["organic"],
        summary="Test brand summary",
    )

    # Candidate 1: High audience fit proxy (has Thai text, keywords matching)
    c1 = KOLCandidate(
        username="thai_speaker_kol",
        normalized_username="thai_speaker_kol",
        display_name="Thai Speaker KOL",
        profile_url="https://www.tiktok.com/@thai_speaker_kol",
        follower_count=50000,
        sample_video_count=2,
        sample_captions=["ออร์แกนิก ใช้ดีมาก"],
        hashtags=["organic", "บิวตี้"],
        thai_language_ratio=0.95,
        local_signal_score=0.90,
        average_views=20000.0,
        average_likes=1000.0,
        estimated_engagement_rate=0.03,
        collected_at="2026-09-17T20:00:00Z",
    )

    # Candidate 2: Same metrics, but zero local text/keywords (proxy will be much lower)
    c2 = KOLCandidate(
        username="neutral_kol",
        normalized_username="neutral_kol",
        display_name="Neutral KOL",
        profile_url="https://www.tiktok.com/@neutral_kol",
        follower_count=50000,
        sample_video_count=2,
        sample_captions=["unrelated English caption"],
        hashtags=["general"],
        thai_language_ratio=0.0,
        local_signal_score=0.90,  # match local_signal_score so local component is identical
        average_views=20000.0,
        average_likes=1000.0,
        estimated_engagement_rate=0.03,
        collected_at="2026-09-17T20:00:00Z",
    )

    sem_results = [
        SemanticMatchResult(
            username="thai_speaker_kol",
            display_name="Thai Speaker KOL",
            profile_url="https://www.tiktok.com/@thai_speaker_kol",
            semantic_relevance_score=80.0,
            cosine_similarity=0.60,
        ),
        SemanticMatchResult(
            username="neutral_kol",
            display_name="Neutral KOL",
            profile_url="https://www.tiktok.com/@neutral_kol",
            semantic_relevance_score=80.0,
            cosine_similarity=0.60,
        ),
    ]

    recs = multi_factor_kol_scorer.score_and_rank_candidates(
        brand_profile=brand,
        candidates=[c1, c2],
        semantic_results=sem_results,
    )

    rec1 = next(r for r in recs if r.username == "thai_speaker_kol")
    rec2 = next(r for r in recs if r.username == "neutral_kol")

    # Audience fit proxy differs
    assert rec1.audience_fit_proxy != rec2.audience_fit_proxy
    # BUT final score is mathematically identical because proxy is NOT in the formula!
    assert rec1.final_score == rec2.final_score


def test_score_boundaries_and_clamping():
    """Verifies that final score stays strictly clamped within [0.0, 100.0]."""
    res_zero = multi_factor_kol_scorer.score_kol(
        semantic_similarity=0.0,
        metrics={
            "engagement_quality_score": 0.0,
            "local_content_relevance_score": 0.0,
            "brand_safety_score": 0.0,
            "data_quality_score": 0.0,
        },
    )
    assert res_zero["final_score"] == 0.0

    res_max = multi_factor_kol_scorer.score_kol(
        semantic_similarity=100.0,
        metrics={
            "engagement_quality_score": 100.0,
            "local_content_relevance_score": 100.0,
            "brand_safety_score": 100.0,
            "data_quality_score": 100.0,
        },
    )
    assert res_max["final_score"] == 100.0

