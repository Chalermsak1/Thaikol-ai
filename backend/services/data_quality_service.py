from typing import Any, Dict, Optional
from schemas.kol import KOLCandidate
from services.scoring_config import load_data_quality_config


class DataQualityService:
    """Evaluates the completeness of a creator profile's observed data fields."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or load_data_quality_config()
        self.expected_fields = self.config.get("expected_fields", {})
        if not self.expected_fields:
            # Default field definitions and weights summing to 1.0
            self.expected_fields = {
                "profile_url": {"weight": 0.15},
                "bio": {"weight": 0.10},
                "follower_count": {"weight": 0.15},
                "sample_videos": {"weight": 0.15},
                "sample_captions": {"weight": 0.15},
                "hashtags": {"weight": 0.10},
                "engagement_metrics": {"weight": 0.10},
                "local_signals": {"weight": 0.10},
            }

    def evaluate_candidate(self, candidate: KOLCandidate) -> float:
        """Calculates completeness score [0.0, 100.0] based on available non-null attributes."""
        checks = {
            "profile_url": bool(candidate.profile_url and candidate.profile_url.strip()),
            "bio": bool(candidate.bio and candidate.bio.strip()),
            "follower_count": candidate.follower_count is not None and candidate.follower_count >= 0,
            "sample_videos": candidate.sample_video_count > 0,
            "sample_captions": bool(candidate.sample_captions and len(candidate.sample_captions) > 0),
            "hashtags": bool(candidate.hashtags and len(candidate.hashtags) > 0),
            "engagement_metrics": (
                candidate.average_views is not None
                or candidate.average_likes is not None
                or candidate.estimated_engagement_rate is not None
            ),
            "local_signals": candidate.thai_language_ratio > 0.0 or candidate.local_signal_score > 0.0,
        }

        total_weight = 0.0
        earned_weight = 0.0

        for field_name, field_cfg in self.expected_fields.items():
            w = float(field_cfg.get("weight", 0.10))
            total_weight += w
            if checks.get(field_name, False):
                earned_weight += w

        if total_weight <= 0.0:
            return 100.0

        score = (earned_weight / total_weight) * 100.0
        return round(max(0.0, min(100.0, score)), 1)


data_quality_service = DataQualityService()
