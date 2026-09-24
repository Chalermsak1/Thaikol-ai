from typing import Any, Dict, List, Optional
from core.logging import logger
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate
from schemas.matching import SemanticMatchResult
from schemas.recommendation import (
    ScoreBreakdownItem,
    ScoreBreakdown,
    KOLRecommendation,
)
from services.interfaces import KOLScorer
from services.scoring_config import get_scoring_weights
from services.semantic_matcher import semantic_kol_matcher
from services.engagement_scorer import calculate_pool_engagement_scores
from services.brand_safety_service import brand_safety_service
from services.data_quality_service import data_quality_service
from services.audience_fit_service import calculate_audience_fit_proxy
from services.explainability_service import explanation_service


class MultiFactorKOLScorer(KOLScorer):
    """Multi-factor explainable recommendation scorer combining semantic, engagement,

    locality, brand safety, and data completeness signals.
    """

    def score_kol(
        self,
        semantic_similarity: float,
        metrics: Dict[str, Any],
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Base KOLScorer interface implementation for backward compatibility."""
        applied_weights = get_scoring_weights(weights)

        sem_score = round(max(0.0, min(100.0, semantic_similarity)), 1)
        eng_score = float(metrics.get("engagement_quality_score", 50.0))
        loc_score = float(metrics.get("local_content_relevance_score", 50.0))
        safe_score = float(metrics.get("brand_safety_score", 100.0))
        data_score = float(metrics.get("data_quality_score", 100.0))

        final_score = round(
            applied_weights["semantic_relevance"] * sem_score
            + applied_weights["engagement_quality"] * eng_score
            + applied_weights["local_content_relevance"] * loc_score
            + applied_weights["brand_safety"] * safe_score
            + applied_weights["data_quality"] * data_score,
            1,
        )

        return {
            "final_score": final_score,
            "semantic_score": sem_score,
            "engagement_score": eng_score,
            "local_score": loc_score,
            "safety_score": safe_score,
            "data_quality_score": data_score,
            "weights": applied_weights,
        }

    def score_and_rank_candidates(
        self,
        brand_profile: BrandProfile,
        candidates: List[KOLCandidate],
        semantic_results: Optional[List[SemanticMatchResult]] = None,
        custom_weights: Optional[Dict[str, float]] = None,
    ) -> List[KOLRecommendation]:
        """Computes multi-factor scores, explanations, and ranks candidates strictly with tie-breaking."""
        if not candidates:
            return []

        weights = get_scoring_weights(custom_weights)

        # 1. Semantic relevance lookup
        if semantic_results is None:
            semantic_results = semantic_kol_matcher.match_brand_with_candidates(brand_profile, candidates)

        semantic_map: Dict[str, SemanticMatchResult] = {r.username: r for r in semantic_results}

        # 2. Pool-relative engagement quality
        engagement_scores = calculate_pool_engagement_scores(candidates)

        recommendations: List[KOLRecommendation] = []

        for cand in candidates:
            sem_res = semantic_map.get(cand.username)
            sem_score = sem_res.semantic_relevance_score if sem_res else 50.0
            sem_score = round(max(0.0, min(100.0, sem_score)), 1)

            eng_score = engagement_scores.get(cand.username, 50.0)
            eng_score = round(max(0.0, min(100.0, eng_score)), 1)

            # Local content relevance (local_signal_score * 100)
            local_score = round((cand.local_signal_score or 0.0) * 100.0, 1)
            local_score = max(0.0, min(100.0, local_score))

            # Brand safety evaluation
            safety_res = brand_safety_service.evaluate_candidate(cand)
            safe_score = safety_res.score

            # Data quality completeness
            data_score = data_quality_service.evaluate_candidate(cand)

            # Audience fit proxy (non-demographic content proxy)
            audience_proxy = calculate_audience_fit_proxy(cand, brand_profile)

            # Calculate weighted contributions
            w_sem = weights["semantic_relevance"]
            w_eng = weights["engagement_quality"]
            w_loc = weights["local_content_relevance"]
            w_safe = weights["brand_safety"]
            w_data = weights["data_quality"]

            c_sem = round(w_sem * sem_score, 2)
            c_eng = round(w_eng * eng_score, 2)
            c_loc = round(w_loc * local_score, 2)
            c_safe = round(w_safe * safe_score, 2)
            c_data = round(w_data * data_score, 2)

            final_score = round(
                w_sem * sem_score
                + w_eng * eng_score
                + w_loc * local_score
                + w_safe * safe_score
                + w_data * data_score,
                1,
            )
            final_score = max(0.0, min(100.0, final_score))

            breakdown = ScoreBreakdown(
                semantic_relevance=ScoreBreakdownItem(
                    score=sem_score, weight=w_sem, weighted_contribution=c_sem
                ),
                engagement_quality=ScoreBreakdownItem(
                    score=eng_score, weight=w_eng, weighted_contribution=c_eng
                ),
                local_content_relevance=ScoreBreakdownItem(
                    score=local_score, weight=w_loc, weighted_contribution=c_loc
                ),
                brand_safety=ScoreBreakdownItem(
                    score=safe_score, weight=w_safe, weighted_contribution=c_safe
                ),
                data_quality=ScoreBreakdownItem(
                    score=data_score, weight=w_data, weighted_contribution=c_data
                ),
                final_score=final_score,
            )

            # Generate deterministic reasons and cautions
            explanations = explanation_service.generate_explanations(
                candidate=cand,
                semantic_score=sem_score,
                engagement_score=eng_score,
                local_score=local_score,
                brand_safety=safety_res,
                data_quality_score=data_score,
            )

            matching_topics = sem_res.matching_topics if sem_res else []

            rec = KOLRecommendation(
                rank=1,  # temporary placeholder before sorting
                username=cand.username,
                display_name=cand.display_name,
                profile_url=cand.profile_url,
                is_profile_verified=getattr(cand, "is_profile_verified", False),
                profile_status=getattr(cand, "profile_status", "unavailable"),
                final_score=final_score,
                semantic_relevance_score=sem_score,
                engagement_quality_score=eng_score,
                local_content_relevance_score=local_score,
                audience_fit_proxy=audience_proxy,
                brand_safety_score=safe_score,
                brand_safety_risk_level=safety_res.risk_level,
                data_quality_score=data_score,
                score_breakdown=breakdown,
                reasons=explanations["reasons"],
                cautions=explanations["cautions"],
                matching_topics=matching_topics,
                data_source=cand.data_source,
                collected_at=cand.collected_at,
                is_demo_fixture=cand.is_demo_fixture,
                provenance=cand.provenance,
            )
            recommendations.append(rec)

        # Deterministic sorting with tie-breaking:
        # 1. final_score DESC
        # 2. semantic_relevance_score DESC
        # 3. engagement_quality_score DESC
        # 4. data_quality_score DESC
        # 5. username ASC
        recommendations.sort(
            key=lambda r: (
                -r.final_score,
                -r.semantic_relevance_score,
                -r.engagement_quality_score,
                -r.data_quality_score,
                r.username,
            )
        )

        # Assign final 1-indexed ranks
        for idx, r in enumerate(recommendations, start=1):
            r.rank = idx

        return recommendations


multi_factor_kol_scorer = MultiFactorKOLScorer()
