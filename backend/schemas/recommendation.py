from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict

from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate


class ScoreBreakdownItem(BaseModel):
    """Component score, applied weight, and calculated weighted contribution."""
    score: float = Field(..., ge=0.0, le=100.0, description="Component score (0.0 - 100.0)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Factor weight (0.0 - 1.0)")
    weighted_contribution: float = Field(
        ..., ge=0.0, le=100.0, description="Calculated contribution to final composite score"
    )


class ScoreBreakdown(BaseModel):
    """Transparent multi-factor score breakdown for a recommended KOL."""
    semantic_relevance: ScoreBreakdownItem
    engagement_quality: ScoreBreakdownItem
    local_content_relevance: ScoreBreakdownItem
    brand_safety: ScoreBreakdownItem
    data_quality: ScoreBreakdownItem
    final_score: float = Field(..., ge=0.0, le=100.0, description="Final composite score")


class BrandSafetyResult(BaseModel):
    """Content-level brand safety screening outcome for campaign suitability."""
    score: float = Field(default=100.0, ge=0.0, le=100.0, description="Brand safety score (0.0 - 100.0)")
    risk_level: Literal["safe", "review", "high_risk"] = Field(
        default="safe", description="Categorical campaign risk level"
    )
    matched_flags: List[str] = Field(default_factory=list, description="Triggered safety categories/flags")
    evidence: List[str] = Field(default_factory=list, description="Specific terms or cues detected")
    disclaimer: str = Field(
        default="Content screening for campaign suitability only; not an assessment of personal character.",
        description="Methodological boundary disclaimer",
    )


class KOLRecommendation(BaseModel):
    """Full explainable recommendation card for a TikTok KOL candidate."""
    rank: int = Field(..., ge=1, description="Rank position (1-indexed)")
    username: str = Field(..., description="TikTok username handle")
    display_name: str = Field(..., description="Creator display name")
    profile_url: Optional[str] = Field(None, description="Public TikTok profile URL if available and verified")
    is_profile_verified: bool = Field(default=False, description="True if profile URL is a verified live account")
    profile_status: str = Field(default="unavailable", description="Profile status: verified | unverified | unavailable")
    final_score: float = Field(..., ge=0.0, le=100.0, description="Composite recommendation score (0.0 - 100.0)")

    # Component scores
    semantic_relevance_score: float = Field(..., ge=0.0, le=100.0)
    engagement_quality_score: float = Field(..., ge=0.0, le=100.0)
    local_content_relevance_score: float = Field(..., ge=0.0, le=100.0)
    audience_fit_proxy: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description=(
            "Audience Fit Proxy is an informational supporting signal based on observable public-content cues. "
            "It is not verified audience demographic data and is not directly included in the current Final Score."
        ),
    )
    brand_safety_score: float = Field(..., ge=0.0, le=100.0)
    brand_safety_risk_level: str = Field(default="safe")
    data_quality_score: float = Field(..., ge=0.0, le=100.0)

    # Detailed explainability & breakdown
    score_breakdown: ScoreBreakdown
    reasons: List[str] = Field(default_factory=list, description="Deterministic recommendation reasons")
    cautions: List[str] = Field(default_factory=list, description="Deterministic caution and review flags")
    matching_topics: List[str] = Field(default_factory=list, description="Deterministic thematic overlap")

    # Provenance tracking
    data_source: str = Field(default="live", description="Origin: live | demo_fixture | apify")
    collected_at: str = Field(..., description="ISO 8601 collection timestamp")
    is_demo_fixture: bool = Field(default=False, description="True if synthetic or curated fixture")
    provenance: str = Field(default="live", description="Data provenance tracker")

    model_config = ConfigDict(from_attributes=True)


class KOLRecommendationRequest(BaseModel):
    """Request payload for multi-factor KOL recommendation."""
    brand_profile: BrandProfile = Field(..., description="Target brand profile")
    kol_candidates: List[KOLCandidate] = Field(..., min_length=1, description="Candidates pool to score and rank")
    custom_weights: Optional[Dict[str, float]] = Field(
        None, description="Optional custom weights override (must sum to 1.0)"
    )


class KOLRecommendationResponse(BaseModel):
    """Response payload returning explainable ranked recommendations."""
    status: str = Field(default="success")
    recommendation_count: int = Field(..., ge=0)
    recommendations: List[KOLRecommendation] = Field(default_factory=list)
    weights_used: Dict[str, float] = Field(..., description="Scoring weights applied")
    audience_data_note: str = Field(
        default="Audience demographics are not directly verified from public content. Audience Fit Proxy uses observable content/locality signals only.",
        description="Mandatory audience data disclaimer",
    )
    brand_profile: Optional[BrandProfile] = Field(
        None, description="Synthesized brand profile for context and explainability"
    )
    search_queries: Optional[List[str]] = Field(
        default_factory=list, description="TikTok search queries generated from brand profile"
    )
    candidate_pool_count: Optional[int] = Field(
        None, description="Total candidate creators discovered in the candidate pool"
    )
    data_source: Optional[str] = Field(
        None, description="Primary data source of candidate pool: live | demo_fixture | apify"
    )


class KOLRecommendationFromBrandRequest(BaseModel):
    """Convenience payload to analyze brand URLs and generate recommendations end-to-end."""
    website_url: Optional[str] = Field(None, description="Client public website URL")
    facebook_page_url: Optional[str] = Field(None, description="Client public Facebook page URL")
    limit: Optional[int] = Field(
        10, ge=1, le=50, description="Max recommendations to return (e.g. 5 or 10)"
    )
    kol_candidates: Optional[List[KOLCandidate]] = Field(
        None, description="Optional candidates list; discovers via TikTok if omitted"
    )
    custom_weights: Optional[Dict[str, float]] = Field(
        None, description="Optional custom weights override"
    )
