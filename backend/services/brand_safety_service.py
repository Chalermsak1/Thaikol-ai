import re
from typing import Any, Dict, List, Optional
from schemas.kol import KOLCandidate
from schemas.recommendation import BrandSafetyResult
from services.scoring_config import load_brand_safety_config


class BrandSafetyService:
    """Performs content-level brand safety screening on public creator text.

    IMPORTANT: This evaluates public content text (captions, bio, hashtags) for
    brand campaign suitability. It does NOT evaluate personal character or off-platform actions.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or load_brand_safety_config()
        self.default_score = float(self.config.get("default_score", 100.0))
        self.categories = self.config.get("categories", {})

    def evaluate_candidate(self, candidate: KOLCandidate) -> BrandSafetyResult:
        """Screens candidate public content and returns transparent BrandSafetyResult."""
        # Aggregate all public text
        text_corpus = []
        if candidate.bio:
            text_corpus.append(candidate.bio)
        if candidate.hashtags:
            text_corpus.extend(candidate.hashtags)
        if candidate.sample_captions:
            text_corpus.extend(candidate.sample_captions)

        full_text = " ".join(text_corpus).lower()

        score = self.default_score
        matched_flags: List[str] = []
        evidence: List[str] = []

        for cat_name, cat_data in self.categories.items():
            deduction = float(cat_data.get("deduction_per_match", 20.0))
            keywords = cat_data.get("keywords", [])
            cat_matched = False

            for kw in keywords:
                pattern = re.escape(kw.lower())
                if re.search(pattern, full_text):
                    if not cat_matched:
                        matched_flags.append(cat_name)
                        score -= deduction
                        cat_matched = True
                    evidence.append(kw)

        clamped_score = round(max(0.0, min(100.0, score)), 1)

        # Categorize risk level
        if clamped_score >= 90.0:
            risk_level = "safe"
        elif clamped_score >= 70.0:
            risk_level = "review"
        else:
            risk_level = "high_risk"

        return BrandSafetyResult(
            score=clamped_score,
            risk_level=risk_level,
            matched_flags=matched_flags,
            evidence=list(dict.fromkeys(evidence)),  # deduplicated
            disclaimer="Content screening for campaign suitability only; not an assessment of personal character.",
        )


brand_safety_service = BrandSafetyService()
