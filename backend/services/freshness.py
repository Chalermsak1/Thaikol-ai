from datetime import datetime, timezone
from typing import Literal, Optional, Union
from core.config import settings

FreshnessState = Literal["fresh", "aging", "stale", "unknown"]


def calculate_data_freshness(
    collected_at: Optional[Union[str, datetime]],
    hours_threshold: Optional[int] = None,
) -> FreshnessState:
    """Calculates data freshness state based on collection timestamp and configured threshold."""
    if not collected_at:
        return "unknown"

    try:
        if isinstance(collected_at, str):
            dt = datetime.fromisoformat(collected_at.replace("Z", "+00:00"))
        elif isinstance(collected_at, datetime):
            dt = collected_at if collected_at.tzinfo else collected_at.replace(tzinfo=timezone.utc)
        else:
            return "unknown"

        now = datetime.now(timezone.utc)
        age_hours = (now - dt).total_seconds() / 3600.0

        threshold = hours_threshold or settings.DATA_FRESHNESS_PROFILE_HOURS
        if age_hours < 0:
            return "fresh"
        elif age_hours <= threshold:
            return "fresh"
        elif age_hours <= threshold * 3:
            return "aging"
        else:
            return "stale"
    except Exception:
        return "unknown"
