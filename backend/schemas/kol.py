from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class TikTokDiscoveryRequest(BaseModel):
    """Request payload for discovering public TikTok creators by keyword queries."""
    queries: List[str] = Field(..., min_length=1, description="List of search queries in Thai or English")
    max_results_per_query: int = Field(default=20, ge=1, le=50, description="Max video records per search query")
    max_candidates: int = Field(default=30, ge=1, le=100, description="Max deduplicated creator candidates to return")

    @field_validator("queries")
    def clean_queries(cls, v: List[str]) -> List[str]:
        cleaned = []
        seen = set()
        for q in v:
            if isinstance(q, str):
                trimmed = q.strip()
                if trimmed and trimmed.lower() not in seen:
                    seen.add(trimmed.lower())
                    cleaned.append(trimmed)
        if not cleaned:
            raise ValueError("At least one non-empty search query must be provided.")
        # Cap to a safe maximum of 10 distinct queries per discovery request
        return cleaned[:10]


class TikTokVideo(BaseModel):
    """Normalized public TikTok video record collected during discovery."""
    video_id: str = Field(..., description="Unique video identifier")
    video_url: str = Field(..., description="Public video URL")
    creator_username: str = Field(..., description="Creator handle without @")
    creator_display_name: Optional[str] = Field(None, description="Creator display name")
    creator_bio: Optional[str] = Field(None, description="Public bio text if available")
    creator_profile_url: str = Field(..., description="Public profile URL")
    follower_count: Optional[int] = Field(None, ge=0, description="Creator follower count if available")
    views: Optional[int] = Field(None, ge=0, description="Video view count")
    likes: Optional[int] = Field(None, ge=0, description="Video like count")
    comments: Optional[int] = Field(None, ge=0, description="Video comment count")
    shares: Optional[int] = Field(None, ge=0, description="Video share count")
    saves: Optional[int] = Field(None, ge=0, description="Video save / bookmark count")
    hashtags: List[str] = Field(default_factory=list, description="Hashtags used in caption")
    caption: Optional[str] = Field(None, description="Video caption text")
    created_at: Optional[str] = Field(None, description="Video publication ISO timestamp")
    data_source: str = Field(default="live", description="Origin: live | demo_fixture | apify")
    collected_at: str = Field(..., description="Collection ISO timestamp")
    is_demo_fixture: bool = Field(default=False, description="True if mock fixture data")
    provenance: str = Field(default="live", description="Provenance tracking tag")

    model_config = ConfigDict(from_attributes=True)


class KOLCandidate(BaseModel):
    """Normalized, deduplicated creator candidate with aggregated metrics and local signals."""
    username: str = Field(..., description="Creator TikTok username")
    normalized_username: str = Field(..., description="Lowercased, sanitized handle for deduplication")
    display_name: str = Field(..., description="Creator display name")
    profile_url: str = Field(..., description="Public TikTok profile URL")
    bio: Optional[str] = Field(None, description="Creator bio text")
    follower_count: Optional[int] = Field(None, ge=0, description="Public follower count")
    sample_video_count: int = Field(default=0, ge=0, description="Number of sampled videos aggregated")

    # Aggregated metrics across sampled videos (Derived)
    total_views: Optional[int] = Field(None, ge=0)
    total_likes: Optional[int] = Field(None, ge=0)
    total_comments: Optional[int] = Field(None, ge=0)
    total_shares: Optional[int] = Field(None, ge=0)
    total_saves: Optional[int] = Field(None, ge=0)
    average_views: Optional[float] = Field(None, ge=0.0)
    average_likes: Optional[float] = Field(None, ge=0.0)
    average_comments: Optional[float] = Field(None, ge=0.0)
    average_shares: Optional[float] = Field(None, ge=0.0)
    average_saves: Optional[float] = Field(None, ge=0.0)

    # Derived metric: Estimated Engagement Rate = (avg_likes + avg_comments + avg_shares) / max(follower_count, 1)
    estimated_engagement_rate: Optional[float] = Field(
        None, ge=0.0, description="Estimated Engagement Rate (derived metric; NOT official TikTok metric)"
    )

    # Content & Search Attribution
    hashtags: List[str] = Field(default_factory=list, description="Aggregated unique hashtags across sample videos")
    sample_captions: List[str] = Field(default_factory=list, description="Recent sampled public video captions")
    matched_queries: List[str] = Field(default_factory=list, description="Search queries that surfaced this creator")

    # Thailand & Local Signals (Content markers only; NOT audience demographics)
    thai_language_ratio: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Approximate percentage of Thai script in sample content"
    )
    thailand_keyword_count: int = Field(
        default=0, ge=0, description="Occurrences of Thailand geographic and cultural keywords"
    )
    thailand_hashtag_count: int = Field(
        default=0, ge=0, description="Count of Thai or Thailand-specific hashtags"
    )
    location_mentions: List[str] = Field(
        default_factory=list, description="Explicit Thailand locations mentioned in captions"
    )
    local_signal_score: float = Field(
        default=0.0, ge=0.0, le=1.0,
        description="Composite score representing Thailand/local content signals, not verified audience location"
    )

    # Provenance
    data_source: str = Field(default="live", description="Origin: live | demo_fixture | apify")
    collected_at: str = Field(..., description="Collection timestamp")
    data_freshness: str = Field(default="fresh", description="Freshness status of the creator data")
    is_demo_fixture: bool = Field(default=False, description="True if synthetic or curated fixture")
    provenance: str = Field(default="live", description="Provenance tracker")

    model_config = ConfigDict(from_attributes=True)


class TikTokDiscoveryResponse(BaseModel):
    """Response payload for the TikTok discovery endpoint."""
    discovery_run_id: str = Field(..., description="Unique ID of this discovery execution run")
    status: str = Field(..., description="Outcome: success | partial | failed")
    candidate_count: int = Field(..., ge=0, description="Number of unique candidates discovered")
    candidates: List[KOLCandidate] = Field(default_factory=list, description="Normalized creator candidates")


class KOLDiscoveryRunResponse(BaseModel):
    """Metadata inspection schema for a discovery run."""
    id: str
    queries: List[str]
    provider: str
    started_at: str
    completed_at: Optional[str] = None
    status: str
    candidate_count: int
    error: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Preserved Phase 0 schemas for backward compatibility
class KOLMetrics(BaseModel):
    followers: int = Field(default=0, description="Follower count")
    avg_views: int = Field(default=0, description="Average views per video")
    engagement_rate: float = Field(default=0.0, description="Engagement rate (0.0 - 1.0)")
    estimated_thai_audience_ratio: float = Field(
        default=0.9, description="Estimated proportion of Thai audience"
    )


class KOLBase(BaseModel):
    tiktok_handle: str = Field(..., description="TikTok username without @")
    display_name: str = Field(..., description="Display name on TikTok")
    profile_url: str = Field(..., description="Public TikTok profile URL")
    bio: Optional[str] = Field(None, description="Public bio text")
    category: Optional[str] = Field(None, description="Primary content category")
    primary_language: str = Field(default="th", description="Primary content language")
    country: str = Field(default="TH", description="Country code")
    content_tags: List[str] = Field(default_factory=list)


class KOLResponse(KOLBase):
    id: str
    metrics: KOLMetrics = Field(default_factory=KOLMetrics)
    recent_captions: List[str] = Field(default_factory=list)
    is_demo_fixture: bool = False
    data_source: str = "live"
    disclaimer: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
