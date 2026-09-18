from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class SourceReference(BaseModel):
    """Pinpoints the origin of an extracted piece of brand text."""
    source: Literal["website", "facebook"] = Field(..., description="Data channel origin")
    source_url: Optional[str] = Field(None, description="Origin URL")
    post_id: Optional[str] = Field(None, description="Facebook post identifier if applicable")
    text: str = Field(..., description="Referenced verbatim text snippet")


class EvidenceItem(BaseModel):
    """Explainability record tying an extracted BrandProfile trait to observed or inferred evidence."""
    field: str = Field(..., description="Target brand profile field (e.g. industry, products_services)")
    source: Literal["website", "facebook", "synthesis"] = Field(..., description="Source of evidence")
    source_url: Optional[str] = Field(None, description="Direct URL origin")
    text: str = Field(..., description="Supporting verbatim or contextual snippet")
    nature: Literal["OBSERVED", "INFERRED", "ESTIMATED"] = Field(
        ...,
        description="OBSERVED: direct source quote; INFERRED: derived pattern; ESTIMATED: proxy measurement"
    )


class WebsiteContent(BaseModel):
    """Normalized payload extracted from a public website."""
    final_url: str = Field(..., description="Final URL after following safe redirects")
    page_title: Optional[str] = Field(None, description="Extracted HTML title tag")
    meta_description: Optional[str] = Field(None, description="Extracted meta description")
    canonical_url: Optional[str] = Field(None, description="Canonical URL if defined")
    og_title: Optional[str] = Field(None, description="OpenGraph og:title tag")
    og_description: Optional[str] = Field(None, description="OpenGraph og:description tag")
    headings: List[str] = Field(default_factory=list, description="Extracted H1, H2, H3 tags")
    visible_text: str = Field(default="", description="Sanitized, noise-free visible text content")
    extracted_at: str = Field(..., description="ISO 8601 UTC timestamp of extraction")
    extraction_status: Literal["success", "failed"] = Field(..., description="Extraction outcome")
    error: Optional[str] = Field(None, description="Controlled error description if failed")


class FacebookPost(BaseModel):
    """Individual public Facebook post extracted from a public page."""
    post_id: str = Field(..., description="Post identifier")
    text: str = Field(..., description="Public post caption or body text")
    published_at: Optional[str] = Field(None, description="Post publication timestamp")
    likes: int = Field(default=0, description="Public like count")
    comments: int = Field(default=0, description="Public comment count")
    shares: int = Field(default=0, description="Public share count")
    post_url: Optional[str] = Field(None, description="Link to the public post")


class FacebookPageContent(BaseModel):
    """Normalized public Facebook page content."""
    page_url: str = Field(..., description="Cleaned public page URL")
    page_name: Optional[str] = Field(None, description="Public Page display name")
    page_category: Optional[str] = Field(None, description="Public page business category")
    about: Optional[str] = Field(None, description="Public Page About / Bio section")
    follower_count: int = Field(default=0, description="Public follower count")
    recent_posts: List[FacebookPost] = Field(default_factory=list, description="Recent public posts")
    extracted_at: str = Field(..., description="ISO 8601 UTC timestamp of extraction")
    extraction_status: Literal["success", "failed"] = Field(..., description="Extraction outcome")
    error: Optional[str] = Field(None, description="Controlled error description if failed")


class BrandCorpus(BaseModel):
    """Consolidated raw brand textual corpus preserving attribution."""
    brand_name_candidates: List[str] = Field(default_factory=list, description="Possible brand names")
    website_text: str = Field(default="", description="Website body and metadata text")
    facebook_about: str = Field(default="", description="Facebook about text")
    facebook_post_texts: List[str] = Field(default_factory=list, description="Recent Facebook post bodies")
    website_headings: List[str] = Field(default_factory=list, description="Key headings from website")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata on extraction origins")
    source_references: List[SourceReference] = Field(
        default_factory=list, description="Attributed verbatim text references"
    )


class BrandProfile(BaseModel):
    """Structured, explainable profile of a brand derived from public signals."""
    brand_name: str = Field(..., description="Identified brand name")
    industry: str = Field(..., description="Identified business category or industry")
    products_services: List[str] = Field(default_factory=list, description="Key products or offerings")
    target_audience: List[str] = Field(
        default_factory=list,
        description="Target customer personas (conservative; never fabricated)"
    )
    content_themes: List[str] = Field(default_factory=list, description="Observed content themes")
    brand_tone: List[str] = Field(default_factory=list, description="Observed tone of voice")
    keywords: List[str] = Field(default_factory=list, description="Thai and English brand keywords")
    location_signals: List[str] = Field(default_factory=list, description="Observed Thailand geographic cues")
    summary: str = Field(default="", description="Concise summary of brand positioning")
    confidence: float = Field(default=0.8, description="Profile confidence score (0.0 - 1.0)")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Granular evidence audit trail")
    is_demo_fixture: bool = Field(default=False, description="True if generated from demo fixture")
    provenance: str = Field(default="live", description="Provenance marker: live | demo_fixture | cached")

    model_config = ConfigDict(from_attributes=True)


class BrandAnalyzeRequest(BaseModel):
    """Request payload to analyze a brand from public web and social sources."""
    website_url: Optional[str] = Field(None, description="Client business website URL")
    facebook_page_url: Optional[str] = Field(None, description="Client public Facebook page URL")


class BrandAnalyzeResponse(BaseModel):
    """Response returning the structured BrandProfile and detailed pipeline statuses."""
    brand_profile: BrandProfile = Field(..., description="Synthesized brand profile with evidence")
    sources: Dict[str, Any] = Field(
        ...,
        description="Raw normalized extraction data from website and Facebook"
    )
    pipeline_status: Dict[str, str] = Field(
        ...,
        description="Outcome of each pipeline step (website, facebook, profiling)"
    )


# Backward-compatible schemas for Phase 0 models
class BrandBase(BaseModel):
    name: str
    category: Optional[str] = None
    website_url: Optional[str] = None
    facebook_url: Optional[str] = None
    country: str = "TH"


class BrandCreate(BrandBase):
    pass


class BrandResponse(BrandBase):
    id: str
    brand_summary: Optional[str] = None
    target_audience: Optional[str] = None
    key_products: List[str] = []
    content_style: Optional[str] = None
    keywords: List[str] = []
    is_demo_fixture: bool = False
    provenance: str = "live"

    model_config = ConfigDict(from_attributes=True)
