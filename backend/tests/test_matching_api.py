import pytest
from starlette.testclient import TestClient
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from services.semantic_matcher import semantic_kol_matcher
from tests.test_semantic_matcher import DeterministicMockEmbeddingService


@pytest.fixture(autouse=True)
def mock_embedding_for_api_tests(monkeypatch):
    """Ensures API tests run reliably and deterministically using mock embedding vectors."""
    mock_svc = DeterministicMockEmbeddingService()
    monkeypatch.setattr(semantic_kol_matcher, "embedding_service", mock_svc)


def test_semantic_matching_api_success(client: TestClient):
    brand = {
        "brand_name": "Khaokho Talaypu",
        "industry": "Natural Beauty & Herbal Care",
        "products_services": ["Herbal Shampoo", "Aloe Vera Gel"],
        "content_themes": ["Hair loss prevention", "Natural ingredients"],
        "keywords": ["แชมพูสมุนไพร", "ผมร่วง", "clean beauty"],
        "summary": "Thai natural herbal hair care brand",
    }

    candidates = [
        {
            "username": "mookda_skincare",
            "normalized_username": "mookda_skincare",
            "display_name": "Mookda รีวิวผิวสวย",
            "profile_url": "https://www.tiktok.com/@mookda_skincare",
            "sample_video_count": 2,
            "sample_captions": ["แชมพูสมุนไพร ลดผมร่วง"],
            "hashtags": ["แชมพูสมุนไพร", "ผมร่วง"],
            "matched_queries": ["แชมพูสมุนไพร"],
            "collected_at": "2026-09-17T00:00:00Z",
        },
        {
            "username": "gamer_th",
            "normalized_username": "gamer_th",
            "display_name": "Gamer Thailand",
            "profile_url": "https://www.tiktok.com/@gamer_th",
            "sample_video_count": 1,
            "sample_captions": ["Live streaming esports tournament"],
            "hashtags": ["gaming", "esports"],
            "matched_queries": ["gaming"],
            "collected_at": "2026-09-17T00:00:00Z",
        },
    ]

    response = client.post(
        "/api/v1/matching/semantic",
        json={"brand_profile": brand, "kol_candidates": candidates},
    )

    assert response.status_code == 200
    data = response.json()

    assert "match_count" in data
    assert data["match_count"] == 2
    assert "matches" in data
    assert len(data["matches"]) == 2

    # Mookda discusses herbal shampoo, should rank higher than gamer
    first = data["matches"][0]
    assert first["username"] == "mookda_skincare"
    assert first["profile_url"] == "https://www.tiktok.com/@mookda_skincare"
    assert "semantic_relevance_score" in first
    assert "cosine_similarity" in first
    assert first["semantic_relevance_score"] >= data["matches"][1]["semantic_relevance_score"]


def test_semantic_matching_api_empty_candidates_fails(client: TestClient):
    brand = {
        "brand_name": "Test Brand",
        "industry": "Retail",
    }

    response = client.post(
        "/api/v1/matching/semantic",
        json={"brand_profile": brand, "kol_candidates": []},
    )

    assert response.status_code == 422


def test_semantic_match_from_brand_api_convenience(client: TestClient):
    response = client.post(
        "/api/v1/matching/semantic-from-brand",
        json={
            "website_url": "https://khaokhotalaypu.com",
            "facebook_page_url": "https://facebook.com/KhaokhoTalaypu",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["match_count"] > 0
    assert len(data["matches"]) > 0
    assert "semantic_relevance_score" in data["matches"][0]
    assert data["matches"][0]["profile_url"].startswith("https://www.tiktok.com/@")
