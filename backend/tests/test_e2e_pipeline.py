from unittest.mock import patch
import pytest
from starlette.testclient import TestClient
from services.semantic_matcher import semantic_kol_matcher


@pytest.fixture(autouse=True)
def mock_embeddings(monkeypatch):
    """Automatically mock embeddings across all e2e tests for sub-second execution."""
    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_batch_embeddings",
        lambda texts: [[0.1] * 384 for _ in texts],
    )
    monkeypatch.setattr(
        semantic_kol_matcher.embedding_service,
        "get_text_embedding",
        lambda text: [0.1] * 384,
    )


def test_e2e_recommend_from_brand_demo_pipeline(client: TestClient):
    """
    End-to-end integration test:
    Business Input (Website + Facebook)
    -> Brand Analysis (BrandProfile with evidence)
    -> KOL Search Query Generation
    -> TikTok Creator Candidate Ingestion (Pool)
    -> AI Multilingual Embeddings & Semantic Matching
    -> Multi-Factor Explainable Scoring
    -> Ranked Recommendations with TikTok Links
    """
    payload = {
        "website_url": "https://www.khaokhotalaypu.com",
        "facebook_page_url": "https://www.facebook.com/Khaokhotalaypu",
        "limit": 5,
    }

    response = client.post("/api/v1/matching/recommend-from-brand", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "success"
    assert data["recommendation_count"] > 0
    assert data["recommendation_count"] <= 5

    # 1. Verify Brand Profile in response
    brand_profile = data["brand_profile"]
    assert brand_profile is not None
    assert "Khaokho Talaypu" in brand_profile["brand_name"]
    assert "Natural Beauty" in brand_profile["industry"] or "Personal Care" in brand_profile["industry"]
    assert len(brand_profile["products_services"]) > 0
    assert len(brand_profile["evidence"]) > 0
    # Verify evidence item distinctions
    natures = [e["nature"] for e in brand_profile["evidence"]]
    assert "OBSERVED" in natures
    assert "INFERRED" in natures

    # 2. Verify Search Queries
    search_queries = data["search_queries"]
    assert isinstance(search_queries, list)
    assert len(search_queries) > 0
    all_query_text = " ".join(search_queries)
    assert any(k in all_query_text for k in ["แชมพู", "สมุนไพร", "natural", "Khaokho", "hair"])

    # 3. Verify Candidate Pool Count & Provenance
    assert data["candidate_pool_count"] is not None
    assert data["candidate_pool_count"] >= data["recommendation_count"]
    assert data["data_source"] in ["demo_fixture", "live", "apify"]

    # 4. Verify Recommendations structure & formulas
    recommendations = data["recommendations"]
    assert len(recommendations) == data["recommendation_count"]
    assert recommendations[0]["rank"] == 1

    weights = data["weights_used"]
    assert abs(sum(weights.values()) - 1.0) < 1e-6

    for rec in recommendations:
        # Score bounds
        assert 0.0 <= rec["final_score"] <= 100.0
        assert 0.0 <= rec["semantic_relevance_score"] <= 100.0
        assert 0.0 <= rec["engagement_quality_score"] <= 100.0
        assert 0.0 <= rec["local_content_relevance_score"] <= 100.0
        assert 0.0 <= rec["brand_safety_score"] <= 100.0
        assert 0.0 <= rec["data_quality_score"] <= 100.0

        # Valid TikTok profile link matching username
        assert rec["profile_url"] == f"https://www.tiktok.com/@{rec['username']}"
        assert rec["username"].strip() != ""

        # Explainability & Breakdown
        breakdown = rec["score_breakdown"]
        assert "semantic_relevance" in breakdown
        assert "engagement_quality" in breakdown
        assert "local_content_relevance" in breakdown
        assert "brand_safety" in breakdown
        assert "data_quality" in breakdown
        assert breakdown["final_score"] == rec["final_score"]

        # Reasons and cautions
        assert isinstance(rec["reasons"], list)
        assert len(rec["reasons"]) > 0
        assert isinstance(rec["cautions"], list)

        # Provenance
        assert "data_source" in rec
        assert "provenance" in rec

    # Audience Data Disclaimer Note
    assert "Audience demographics are not directly verified" in data["audience_data_note"]


def test_e2e_recommend_demo_mode_empty_payload_uses_fixture(client: TestClient):
    """Verify that calling with empty payload in DEMO_MODE defaults to Khaokho Talaypu fixture."""
    response = client.post("/api/v1/matching/recommend-from-brand", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Khaokho Talaypu" in data["brand_profile"]["brand_name"]


def test_e2e_recommend_missing_urls_fails_in_live_mode(client: TestClient):
    """Verify that calling without URLs in live mode yields 422 Unprocessable Content."""
    with patch("core.config.settings.DEMO_MODE", False):
        response = client.post("/api/v1/matching/recommend-from-brand", json={})
        assert response.status_code == 422


def test_e2e_recommend_invalid_weights_fails(client: TestClient):
    """Verify that specifying malformed custom weights fails gracefully with 422."""
    payload = {
        "website_url": "https://www.khaokhotalaypu.com",
        "facebook_page_url": "https://www.facebook.com/Khaokhotalaypu",
        "custom_weights": {
            "semantic_relevance": 0.9,
            "engagement_quality": 0.5,  # Sum = 1.4, invalid
            "local_content_relevance": 0.0,
            "brand_safety": 0.0,
            "data_quality": 0.0,
        },
    }
    response = client.post("/api/v1/matching/recommend-from-brand", json=payload)
    assert response.status_code == 422
