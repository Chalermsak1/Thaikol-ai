from typing import Any, Dict, List, Optional
from schemas.kol import KOLCandidate
from schemas.recommendation import BrandSafetyResult
from services.scoring_config import get_explainability_thresholds


class RecommendationExplanationService:
    """Generates deterministic, rule-based recommendation reasons and caution flags.

    Completely eliminates LLM hallucinations and ensures auditability.
    """

    def __init__(self, thresholds: Optional[Dict[str, Any]] = None):
        self.thresholds = thresholds or get_explainability_thresholds()

    def generate_explanations(
        self,
        candidate: KOLCandidate,
        semantic_score: float,
        engagement_score: float,
        local_score: float,
        brand_safety: BrandSafetyResult,
        data_quality_score: float,
    ) -> Dict[str, List[str]]:
        reasons: List[str] = []
        cautions: List[str] = []

        # 1. Semantic relevance explanations
        if semantic_score >= 85.0:
            reasons.append("Strong content relevance to the brand.")
        elif semantic_score >= 70.0:
            reasons.append("Good semantic alignment with the brand's content themes.")
        elif semantic_score < 50.0:
            cautions.append("Lower content overlap with brand core themes.")

        # 2. Engagement quality explanations
        if engagement_score >= 80.0:
            reasons.append("Strong engagement compared with the current candidate pool.")
        elif engagement_score < 40.0:
            cautions.append("Engagement metrics are lower than median candidate pool performance.")

        # 3. Local content relevance explanations
        if local_score >= 80.0:
            reasons.append("Strong Thailand/local content signals.")
        elif local_score < 40.0:
            cautions.append("Limited observable Thailand-specific language or location cues.")

        # 4. Brand safety flags & cautions
        if brand_safety.score < 100.0:
            flag_str = ", ".join(brand_safety.matched_flags) if brand_safety.matched_flags else "unspecified"
            cautions.append(f"Contains public-content signals that may require campaign review ({flag_str}).")
        else:
            reasons.append("Clean public content screening with no detected safety flags.")

        # 5. Data quality & completeness cautions
        if data_quality_score < 70.0:
            cautions.append("Some creator metrics or profile information are incomplete.")

        if candidate.follower_count is None:
            cautions.append("Follower count is missing; engagement is estimated from sampled video metrics.")

        # Safeguard: Ensure at least one informative statement
        if not reasons:
            reasons.append("Candidate matches general discovery search criteria.")

        return {
            "reasons": reasons,
            "cautions": cautions,
        }


explanation_service = RecommendationExplanationService()
