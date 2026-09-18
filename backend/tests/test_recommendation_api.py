import pytest
from starlette.testclient import TestClient
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate


def test_recommend_creators_api_success(client: TestClient, monkeypatch):
    # Mock embedding service to return deterministic vector
    from services.semantic_matcher import semantic_kol_matcher

    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_text_embedding",
        lambda text: [0.1] * 384,
    )
    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_batch_embeddings",
        lambda texts: [[0.1] * 384 for _ in texts],
    )

    payload = {
        "brand_profile": {
            "brand_name": "เขาค้อทะเลภู",
            "industry": "Herbal Haircare",
            "keywords": ["แชมพูสมุนไพร", "ลดผมร่วง"],
            "summary": "แบรนด์แชมพูธรรมชาติ",
        },
        "kol_candidates": [
            {
                "username": "mookda_skincare",
                "normalized_username": "mookda_skincare",
                "display_name": "Mookda รีวิวผิวสวย",
                "profile_url": "https://www.tiktok.com/@mookda_skincare",
                "follower_count": 145000,
                "sample_video_count": 2,
                "average_views": 38000.0,
                "average_likes": 1975.0,
                "estimated_engagement_rate": 0.015,
                "matched_queries": ["แชมพูสมุนไพร"],
                "hashtags": ["แชมพูสมุนไพร", "ลดผมร่วง"],
                "sample_captions": ["แชมพูลดผมร่วงสมุนไพรไทยแท้"],
                "thai_language_ratio": 0.92,
                "local_signal_score": 0.85,
                "collected_at": "2026-09-17T20:00:00Z",
            }
        ],
    }

    response = client.post("/api/v1/matching/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["recommendation_count"] == 1
    rec = data["recommendations"][0]
    assert rec["username"] == "mookda_skincare"
    assert rec["rank"] == 1
    assert "score_breakdown" in rec
    assert "final_score" in rec
    assert len(rec["reasons"]) > 0
    assert "Audience demographics are not directly verified" in data["audience_data_note"]


def test_recommend_creators_api_empty_candidates_fails(client: TestClient):
    payload = {
        "brand_profile": {
            "brand_name": "เขาค้อทะเลภู",
            "industry": "Herbal Haircare",
        },
        "kol_candidates": [],
    }
    response = client.post("/api/v1/matching/recommend", json=payload)
    assert response.status_code == 422


def test_recommend_creators_api_invalid_weights_fails(client: TestClient):
    payload = {
        "brand_profile": {
            "brand_name": "เขาค้อทะเลภู",
            "industry": "Herbal Haircare",
        },
        "kol_candidates": [
            {
                "username": "creator1",
                "normalized_username": "creator1",
                "display_name": "Creator 1",
                "profile_url": "https://www.tiktok.com/@creator1",
                "collected_at": "2026-09-17T20:00:00Z",
            }
        ],
        "custom_weights": {
            "semantic_relevance": 0.9,
            "engagement_quality": 0.9,  # Sum != 1.0
        },
    }
    response = client.post("/api/v1/matching/recommend", json=payload)
    assert response.status_code == 422


def test_recommend_from_brand_api_demo_flow(client: TestClient, monkeypatch):
    from services.semantic_matcher import semantic_kol_matcher

    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_text_embedding",
        lambda text: [0.1] * 384,
    )
    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_batch_embeddings",
        lambda texts: [[0.1] * 384 for _ in texts],
    )

    payload = {
        "website_url": "https://www.khaokhotalaypu.com",
        "facebook_page_url": "https://www.facebook.com/Khaokhotalaypu",
    }
    response = client.post("/api/v1/matching/recommend-from-brand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["recommendation_count"] > 0
    assert data["recommendations"][0]["rank"] == 1
