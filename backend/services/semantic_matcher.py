import math
from typing import Any, Dict, List, Optional
from core.logging import logger
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from schemas.matching import SemanticMatchResult
from services.interfaces import KOLMatcher, EmbeddingService
from services.embedding_service import get_embedding_service
from services.text_representation import (
    build_brand_embedding_text,
    build_creator_embedding_text,
    extract_matching_topics,
)


def calculate_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculates numerically stable cosine similarity between two vector embeddings.

    Handles zero vectors safely by returning 0.0. Clamps output to [-1.0, 1.0].
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_prod = 0.0
    norm_a = 0.0
    norm_b = 0.0

    for a, b in zip(vec_a, vec_b):
        dot_prod += a * b
        norm_a += a * a
        norm_b += b * b

    if norm_a <= 0.0 or norm_b <= 0.0:
        return 0.0

    sim = dot_prod / (math.sqrt(norm_a) * math.sqrt(norm_b))
    return max(-1.0, min(1.0, round(sim, 6)))


def transform_similarity_to_score(cos_sim: float) -> float:
    """Transforms raw cosine similarity [-1.0, 1.0] to user-facing 0.0–100.0 Semantic Relevance Score.

    Formula: ((cos_sim + 1.0) / 2.0) * 100.0
    """
    score = ((cos_sim + 1.0) / 2.0) * 100.0
    return round(max(0.0, min(100.0, score)), 1)


class SemanticKOLMatcher(KOLMatcher):
    """Computes semantic content relevance between a client BrandProfile and TikTok creator candidates."""

    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        self.embedding_service = embedding_service or get_embedding_service()

    def match_kols(
        self,
        brand_vector: List[float],
        kol_vectors: List[List[float]],
        top_k: int = 10,
    ) -> List[Dict[str, Any]]:
        """Implements base KOLMatcher interface calculating cosine similarity rankings."""
        ranked: List[Dict[str, Any]] = []
        for idx, k_vec in enumerate(kol_vectors):
            sim = calculate_cosine_similarity(brand_vector, k_vec)
            score = transform_similarity_to_score(sim)
            ranked.append(
                {
                    "index": idx,
                    "cosine_similarity": sim,
                    "semantic_relevance_score": score,
                }
            )

        ranked.sort(key=lambda x: x["semantic_relevance_score"], reverse=True)
        return ranked[:top_k]

    def match_brand_with_candidates(
        self,
        brand_profile: BrandProfile,
        candidates: List[KOLCandidate],
    ) -> List[SemanticMatchResult]:
        """Calculates pairwise semantic relevance between BrandProfile and candidates.

        CRITICAL: Ranks candidates STRICTLY by semantic_relevance_score DESC.
        Does NOT factor in follower count, view counts, or engagement metrics.
        """
        if not candidates:
            return []

        # 1. Format deterministic text representations
        brand_text = build_brand_embedding_text(brand_profile)
        creator_texts = [build_creator_embedding_text(c) for c in candidates]

        # 2. Generate embeddings
        logger.info("Computing embeddings for brand '%s' and %d candidates", brand_profile.brand_name, len(candidates))
        brand_vector = self.embedding_service.get_text_embedding(brand_text)
        candidate_vectors = self.embedding_service.get_batch_embeddings(creator_texts)

        # 3. Compute similarities and extract matching topics
        results: List[SemanticMatchResult] = []
        for cand, c_vec, c_text in zip(candidates, candidate_vectors, creator_texts):
            sim = calculate_cosine_similarity(brand_vector, c_vec)
            score = transform_similarity_to_score(sim)
            topics = extract_matching_topics(brand_profile, cand)

            results.append(
                SemanticMatchResult(
                    username=cand.username,
                    display_name=cand.display_name,
                    profile_url=cand.profile_url,
                    is_profile_verified=getattr(cand, "is_profile_verified", False),
                    profile_status=getattr(cand, "profile_status", "unavailable"),
                    semantic_relevance_score=score,
                    cosine_similarity=sim,
                    matching_topics=topics,
                    brand_text=brand_text,
                    creator_text=c_text,
                    data_source=cand.data_source,
                    is_demo_fixture=cand.is_demo_fixture,
                    provenance=cand.provenance,
                )
            )

        # 4. Sort strictly by semantic_relevance_score DESC
        results.sort(key=lambda r: r.semantic_relevance_score, reverse=True)
        return results


semantic_kol_matcher = SemanticKOLMatcher()
