import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, Integer
from core.database import Base


class KOLShortlistItemModel(Base):
    """Persisted Shortlist item representing creator collaboration workflow and live tracking."""
    __tablename__ = "kol_shortlist_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(100), default="default", index=True, nullable=False)
    username = Column(String(100), index=True, nullable=False)
    status = Column(String(50), default="shortlisted", nullable=False)
    notes = Column(Text, nullable=True)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Milestones & Budget
    draft_due_date = Column(String(50), nullable=True)
    live_date = Column(String(50), nullable=True)
    agreed_rate_thb = Column(Float, nullable=True)
    deliverable_format = Column(String(100), nullable=True)

    # Attachments & Briefs
    document_links = Column(JSON, default=list)

    # Post-Campaign Live Post Tracking & Actual Performance
    live_post_url = Column(String(512), nullable=True)
    actual_cost_thb = Column(Float, nullable=True)
    actual_views = Column(Integer, nullable=True)
    actual_likes = Column(Integer, nullable=True)
    actual_comments = Column(Integer, nullable=True)
    actual_shares = Column(Integer, nullable=True)
    tracking_status = Column(String(50), default="pending_post")
    tracking_updated_at = Column(DateTime, nullable=True)

    # Full serialized creator snapshot (KOLRecommendation) for lossless cross-device restoration
    creator_snapshot = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
