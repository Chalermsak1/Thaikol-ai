from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentAttachmentSchema(BaseModel):
    id: str = Field(..., description="Unique document attachment ID")
    label: str = Field(..., description="Attachment label or filename")
    url: str = Field(..., description="URL or download link")


class ShortlistItemSchema(BaseModel):
    username: str = Field(..., description="TikTok creator handle without @")
    campaign_id: str = Field(default="default", description="Associated Campaign Workspace ID")
    status: str = Field(
        default="shortlisted",
        description="Workflow state: shortlisted | contacted | negotiating | confirmed | completed | declined",
    )
    notes: Optional[str] = Field(default="", description="Internal brand notes or action items")
    added_at: Optional[str] = Field(default=None, description="ISO timestamp when item was added")

    # Workflow dates & deliverables
    draft_due_date: Optional[str] = Field(default=None, description="Target draft video review date")
    live_date: Optional[str] = Field(default=None, description="Target or actual publishing date")
    agreed_rate_thb: Optional[float] = Field(default=None, description="Negotiated rate card in THB")
    deliverable_format: Optional[str] = Field(default=None, description="Deliverable format e.g. 1 TikTok Video + Link")
    document_links: List[Dict[str, Any]] = Field(default_factory=list, description="Attached briefs, contracts, or guidelines")

    # Post-Campaign Tracking
    live_post_url: Optional[str] = Field(default=None, description="Live published TikTok clip URL")
    actual_cost_thb: Optional[float] = Field(default=None, description="Actual paid cost in THB")
    actual_views: Optional[int] = Field(default=None, ge=0, description="Actual video views achieved")
    actual_likes: Optional[int] = Field(default=None, ge=0, description="Actual likes achieved")
    actual_comments: Optional[int] = Field(default=None, ge=0, description="Actual comments achieved")
    actual_shares: Optional[int] = Field(default=None, ge=0, description="Actual shares achieved")
    tracking_status: Optional[str] = Field(default="pending_post", description="pending_post | live | tracking_done")
    tracking_updated_at: Optional[str] = Field(default=None, description="ISO timestamp of last tracking update")

    # Lossless creator snapshot
    creator: Optional[Dict[str, Any]] = Field(default=None, description="Complete serialized KOLRecommendation snapshot")

    model_config = ConfigDict(from_attributes=True)


class ShortlistUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    campaign_id: Optional[str] = None
    draft_due_date: Optional[str] = None
    live_date: Optional[str] = None
    agreed_rate_thb: Optional[float] = None
    deliverable_format: Optional[str] = None
    document_links: Optional[List[Dict[str, Any]]] = None
    live_post_url: Optional[str] = None
    actual_cost_thb: Optional[float] = None
    actual_views: Optional[int] = None
    actual_likes: Optional[int] = None
    actual_comments: Optional[int] = None
    actual_shares: Optional[int] = None
    tracking_status: Optional[str] = None
    creator: Optional[Dict[str, Any]] = None


class ShortlistSyncRequest(BaseModel):
    items: List[ShortlistItemSchema] = Field(default_factory=list, description="Array of shortlist items to sync")


class ShortlistSyncResponse(BaseModel):
    status: str = Field(default="success")
    synced_count: int = Field(default=0)
    items: List[ShortlistItemSchema] = Field(default_factory=list)
