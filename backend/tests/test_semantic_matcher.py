import pytest
from typing import List
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from services.interfaces import EmbeddingService
from services.semantic_matcher import SemanticKOLMatcher


class DeterministicMockEmbeddingService(EmbeddingService):
    """Predictable mock embedding service returning preset vectors based on keywords in text."""

    def get_text_embedding(self, text: str) -> List[float]:
        # Return hair/herbal topic vector
        if "shampoo" in text.lower() or "สมุนไพร" in text.lower() or "hair" in text.lower():
            return [1.0, 0.0, 0.0]
        elif "eco" in text.lower() or "organic" in text.lower():
            return [0.7, 0.7, 0.0]
        else:
            return [0.0, 0.0, 1.0]

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        return [self.get_text_embedding(t) for t in texts]


def test_semantic_kol_matcher_ranks_strictly_by_semantic_score():
    mock_service = DeterministicMockEmbeddingService()
    matcher = SemanticKOLMatcher(embedding_service=mock_service)

    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Natural Beauty",
        keywords=["แชมพูสมุนไพร", "hair"],
    )

    # Candidate 1: High semantic match (shampoo/herbal), but lower follower count (10k)
    cand_high_semantic = KOLCandidate(
        username="mookda_skincare",
        normalized_username="mookda_skincare",
        display_name="Mookda",
        profile_url="https://www.tiktok.com/@mookda_skincare",
        follower_count=10000,
        average_views=5000.0,
        sample_captions=["แชมพูสมุนไพร ลดผมร่วง"],
        hashtags=["แชมพูสมุนไพร"],
        collected_at="2026-09-17T00:00:00Z",
    )

    # Candidate 2: Low semantic match (motorcycle), but HUGE follower count (1M)
    cand_low_semantic = KOLCandidate(
        username="biker_boy",
        normalized_username="biker_boy",
        display_name="Biker Boy",
        profile_url="https://www.tiktok.com/@biker_boy",
        follower_count=1000000,
        average_views=500000.0,
        sample_captions=["รีวิวมอเตอร์ไซค์แต่งสวย"],
        hashtags=["racing"],
        collected_at="2026-09-17T00:00:00Z",
    )

    # Candidate 3: Moderate semantic match (organic lifestyle)
    cand_mid_semantic = KOLCandidate(
        username="clean_living",
        normalized_username="clean_living",
        display_name="Clean Living",
        profile_url="https://www.tiktok.com/@clean_living",
        follower_count=50000,
        sample_captions=["Organic food and clean lifestyle"],
        hashtags=["organic", "eco"],
        collected_at="2026-09-17T00:00:00Z",
    )

    results = matcher.match_brand_with_candidates(
        brand_profile=brand,
        candidates=[cand_low_semantic, cand_high_semantic, cand_mid_semantic],
    )

    assert len(results) == 3

    # STRICT ASSERTION: Ranks strictly by semantic_relevance_score DESC
    # Even though biker_boy has 1,000,000 followers, mookda MUST be #1!
    assert results[0].username == "mookda_skincare"
    assert results[0].semantic_relevance_score > results[1].semantic_relevance_score
    assert results[1].username == "clean_living"
    assert results[1].semantic_relevance_score > results[2].semantic_relevance_score
    assert results[2].username == "biker_boy"

    # Profile URLs preserved
    assert results[0].profile_url == "https://www.tiktok.com/@mookda_skincare"


def test_semantic_kol_matcher_empty_candidates():
    matcher = SemanticKOLMatcher(embedding_service=DeterministicMockEmbeddingService())
    brand = BrandProfile(brand_name="Test Brand", industry="Retail")
    results = matcher.match_brand_with_candidates(brand, [])
    assert results == []
