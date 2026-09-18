from typing import Optional
from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate


def calculate_audience_fit_proxy(
    candidate: KOLCandidate,
    brand_profile: Optional[BrandProfile] = None,
) -> Optional[float]:
    """Calculates an Audience Fit Proxy [0.0, 100.0] based ONLY on observable public content signals.

    CRITICAL BOUNDARY DISCLAIMER:
    This is an observable content proxy, NOT verified audience demographics.
    It does NOT measure or claim verified follower age, gender, household income, or GPS locations.

    Returns None if public content is insufficient to form a confident proxy.
    """
    # If no sample content or bio is available, we cannot support a confident proxy
    if not candidate.sample_captions and not candidate.bio and not candidate.hashtags:
        return None

    # Base component: Local content presence (40%)
    local_part = (candidate.local_signal_score or 0.0) * 40.0

    # Language component: Thai language ratio (30%)
    lang_part = (candidate.thai_language_ratio or 0.0) * 30.0

    # Content & interest alignment component (30%)
    interest_part = 15.0  # baseline interest alignment
    if brand_profile:
        # Check lexical match between brand target audience / keywords and creator tags
        brand_tokens = set()
        if brand_profile.keywords:
            brand_tokens.update(k.lower() for k in brand_profile.keywords)
        if brand_profile.target_audience:
            brand_tokens.update(a.lower() for a in brand_profile.target_audience)

        cand_tokens = set()
        if candidate.hashtags:
            cand_tokens.update(h.lower().lstrip("#") for h in candidate.hashtags)
        if candidate.matched_queries:
            cand_tokens.update(q.lower() for q in candidate.matched_queries)

        overlap = brand_tokens.intersection(cand_tokens)
        if overlap:
            interest_part += min(15.0, len(overlap) * 5.0)

    proxy_score = local_part + lang_part + interest_part
    return round(max(0.0, min(100.0, proxy_score)), 1)
