from typing import List, Optional, Dict, Any
from schemas.kol import KOLCandidate


def _calculate_percentile(val: float, all_vals: List[float]) -> float:
    """Calculates empirical percentile rank of val within all_vals in range [0.0, 100.0]."""
    if not all_vals:
        return 50.0
    if len(all_vals) == 1:
        return 50.0

    less_count = sum(1 for x in all_vals if x < val)
    equal_count = sum(1 for x in all_vals if x == val)
    pct = ((less_count + 0.5 * equal_count) / len(all_vals)) * 100.0
    return round(max(0.0, min(100.0, pct)), 2)


def calculate_pool_engagement_scores(candidates: List[KOLCandidate]) -> Dict[str, float]:
    """Calculates relative engagement quality scores across a candidate pool.

    Uses relative normalization:
      - 70% Estimated Engagement Rate Percentile
      - 30% Reach Efficiency Percentile (average_views / follower_count)

    If follower_count is missing:
      - Reach efficiency cannot be computed safely without guessing.
      - Weight redistributes 100% to engagement rate or available view percentiles.
      - Never silently coerces missing values to zero or fabricates data.
    """
    if not candidates:
        return {}

    # Extract observed non-None pools
    er_pool: List[float] = [
        c.estimated_engagement_rate for c in candidates if c.estimated_engagement_rate is not None
    ]

    reach_pool: List[float] = []
    for c in candidates:
        if c.average_views is not None and c.follower_count is not None and c.follower_count > 0:
            reach_pool.append(c.average_views / c.follower_count)

    # Fallback pool for average views if neither ER nor reach can be computed
    views_pool: List[float] = [
        c.average_views for c in candidates if c.average_views is not None
    ]

    scores: Dict[str, float] = {}

    for c in candidates:
        signals: List[Dict[str, float]] = []

        # Signal 1: Estimated Engagement Rate (nominal weight 0.70)
        if c.estimated_engagement_rate is not None and er_pool:
            p_er = _calculate_percentile(c.estimated_engagement_rate, er_pool)
            signals.append({"score": p_er, "nominal_weight": 0.70})

        # Signal 2: Reach Efficiency (nominal weight 0.30)
        if c.average_views is not None and c.follower_count is not None and c.follower_count > 0 and reach_pool:
            eff = c.average_views / c.follower_count
            p_reach = _calculate_percentile(eff, reach_pool)
            signals.append({"score": p_reach, "nominal_weight": 0.30})

        # Fallback Signal 3: If no ER or Reach, use Average Views percentile
        if not signals and c.average_views is not None and views_pool:
            p_views = _calculate_percentile(c.average_views, views_pool)
            signals.append({"score": p_views, "nominal_weight": 1.0})

        # Combine with proportional weight redistribution
        if signals:
            total_weight = sum(s["nominal_weight"] for s in signals)
            weighted_sum = sum(s["score"] * (s["nominal_weight"] / total_weight) for s in signals)
            score = round(max(0.0, min(100.0, weighted_sum)), 1)
        else:
            # All engagement metrics missing: assign conservative neutral baseline 50.0
            score = 50.0

        scores[c.username] = score

    return scores


def calculate_single_engagement_score(candidate: KOLCandidate, pool: Optional[List[KOLCandidate]] = None) -> float:
    """Calculates engagement quality score for a single candidate given a pool."""
    full_pool = pool if pool else [candidate]
    res = calculate_pool_engagement_scores(full_pool)
    return res.get(candidate.username, 50.0)
