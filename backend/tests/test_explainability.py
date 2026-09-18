from schemas.kol import KOLCandidate
from schemas.recommendation import BrandSafetyResult
from services.explainability_service import explanation_service


def test_explainability_high_scores_generate_positive_reasons():
    c = KOLCandidate(
        username="top_creator",
        normalized_username="top_creator",
        display_name="Top Creator",
        profile_url="https://www.tiktok.com/@top_creator",
        follower_count=100000,
        sample_video_count=5,
        sample_captions=["Great content"],
        collected_at="2026-09-17T20:00:00Z",
    )
    safe = BrandSafetyResult(score=100.0, risk_level="safe")

    res = explanation_service.generate_explanations(
        candidate=c,
        semantic_score=88.0,
        engagement_score=85.0,
        local_score=90.0,
        brand_safety=safe,
        data_quality_score=95.0,
    )
    assert any("Strong content relevance" in r for r in res["reasons"])
    assert any("Strong engagement" in r for r in res["reasons"])
    assert any("Strong Thailand/local content" in r for r in res["reasons"])
    assert len(res["cautions"]) == 0


def test_explainability_low_scores_generate_cautions():
    c = KOLCandidate(
        username="low_creator",
        normalized_username="low_creator",
        display_name="Low Creator",
        profile_url="https://www.tiktok.com/@low_creator",
        follower_count=None,  # Missing follower count
        sample_video_count=1,
        sample_captions=[],
        collected_at="2026-09-17T20:00:00Z",
    )
    risky = BrandSafetyResult(
        score=75.0,
        risk_level="review",
        matched_flags=["hateful_harassing_language"],
    )

    res = explanation_service.generate_explanations(
        candidate=c,
        semantic_score=40.0,
        engagement_score=35.0,
        local_score=30.0,
        brand_safety=risky,
        data_quality_score=50.0,
    )
    assert any("Lower content overlap" in c for c in res["cautions"])
    assert any("campaign review" in c for c in res["cautions"])
    assert any("Follower count is missing" in c for c in res["cautions"])
    assert any("incomplete" in c for c in res["cautions"])
