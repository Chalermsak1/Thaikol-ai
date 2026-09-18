
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from schemas.brand import BrandProfile
from schemas.kol import KOLCandidate


class SemanticMatchRequest(BaseModel):
    """Request payload for comparing a BrandProfile against a list of KOL candidates."""
    brand_profile: BrandProfile = Field(..., description="Target brand profile containing industry, products, and themes")
    kol_candidates: List[KOLCandidate] = Field(..., min_length=1, description="List of discovered creator candidates to match")


class SemanticMatchResult(BaseModel):
    """Pairwise semantic matching result between brand and a creator candidate."""
    username: str = Field(..., description="Creator TikTok username")
    display_name: str = Field(..., description="Creator display name")
    profile_url: str = Field(..., description="Public TikTok profile URL")
    semantic_relevance_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Semantic Relevance Score (0.0 - 100.0 derived from cosine similarity)",
    )
    cosine_similarity: float = Field(
        ...,
        ge=-1.0,
        le=1.0,
        description="Raw vector cosine similarity between brand and creator text embeddings",
    )
    matching_topics: List[str] = Field(
        default_factory=list,
        description="Lexical and thematic overlap identified between brand themes and creator content",
    )
    brand_text: Optional[str] = Field(None, description="Preprocessed brand text representation")
    creator_text: Optional[str] = Field(None, description="Preprocessed creator text representation")
    data_source: str = Field(default="live", description="Origin of creator data: live | demo_fixture | apify")
    is_demo_fixture: bool = Field(default=False, description="True if creator candidate is from curated fixture")
    provenance: str = Field(default="live", description="Data provenance tracker")

    model_config = ConfigDict(from_attributes=True)


class SemanticMatchResponse(BaseModel):
    """Response payload containing semantically ranked creator matches."""
    match_count: int = Field(..., ge=0, description="Total number of candidates matched")
    matches: List[SemanticMatchResult] = Field(
        default_factory=list,
        description="Creators ranked strictly by semantic_relevance_score in descending order",
    )
    embedding_model: str = Field(..., description="Name of the multilingual sentence-transformers model used")


class SemanticMatchFromBrandRequest(BaseModel):
    """Convenience payload to analyze brand URLs and match candidates in an end-to-end pipeline."""
    website_url: Optional[str] = Field(None, description="Client public website URL")
    facebook_page_url: Optional[str] = Field(None, description="Client public Facebook page URL")
    kol_candidates: Optional[List[KOLCandidate]] = Field(
        None, description="Optional candidates list; defaults to standard discovered candidates if omitted"
    )
