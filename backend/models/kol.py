import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


class KOLCandidateModel(Base):
    """Normalized creator candidate identified from public TikTok searches."""
    __tablename__ = "kol_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), nullable=False)
    normalized_username = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    profile_url = Column(String(512), index=True, nullable=False)
    bio = Column(Text, nullable=True)
    follower_count = Column(Integer, nullable=True)
    sample_video_count = Column(Integer, default=0)

    # Derived aggregate metrics
    total_views = Column(Integer, nullable=True)
    total_likes = Column(Integer, nullable=True)
    total_comments = Column(Integer, nullable=True)
    total_shares = Column(Integer, nullable=True)
    total_saves = Column(Integer, nullable=True)
    average_views = Column(Float, nullable=True)
    average_likes = Column(Float, nullable=True)
    average_comments = Column(Float, nullable=True)
    average_shares = Column(Float, nullable=True)
    average_saves = Column(Float, nullable=True)
    estimated_engagement_rate = Column(Float, nullable=True)

    # Content attribution
    hashtags = Column(JSON, default=list)
    sample_captions = Column(JSON, default=list)
    matched_queries = Column(JSON, default=list)

    # Local Thailand content signals (Content metrics; NOT verified audience demographics)
    thai_language_ratio = Column(Float, default=0.0)
    thailand_keyword_count = Column(Integer, default=0)
    thailand_hashtag_count = Column(Integer, default=0)
    location_mentions = Column(JSON, default=list)
    local_signal_score = Column(Float, default=0.0)

    # Provenance & lifecycle
    data_source = Column(String(50), default="live", index=True)
    collected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_demo_fixture = Column(Boolean, default=False)
    provenance = Column(String(50), default="live")

    sample_videos = relationship("KOLSampleVideoModel", back_populates="candidate", cascade="all, delete-orphan")


class KOLSampleVideoModel(Base):
    """Sampled public video associated with a discovered creator."""
    __tablename__ = "kol_sample_videos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kol_candidate_id = Column(String(36), ForeignKey("kol_candidates.id", ondelete="CASCADE"), index=True, nullable=False)
    video_id = Column(String(100), index=True, nullable=False)
    video_url = Column(String(512), nullable=False)
    caption = Column(Text, nullable=True)
    hashtags = Column(JSON, default=list)
    views = Column(Integer, nullable=True)
    likes = Column(Integer, nullable=True)
    comments = Column(Integer, nullable=True)
    shares = Column(Integer, nullable=True)
    saves = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("KOLCandidateModel", back_populates="sample_videos")


class KOLDiscoveryRunModel(Base):
    """Audit log tracking each creator discovery operation."""
    __tablename__ = "kol_discovery_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    queries = Column(JSON, default=list)
    provider = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="running")
    candidate_count = Column(Integer, default=0)
    error = Column(Text, nullable=True)


# Preserved Phase 0 model
class KOLModel(Base):
    __tablename__ = "kols"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tiktok_handle = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    profile_url = Column(String(512), nullable=False)
    bio = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    primary_language = Column(String(10), default="th")
    country = Column(String(10), default="TH")

    content_tags = Column(JSON, default=list)
    recent_captions = Column(JSON, default=list)

    followers = Column(Integer, default=0)
    avg_views = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    estimated_thai_audience_ratio = Column(Float, default=0.9)

    is_demo_fixture = Column(Boolean, default=False)
    data_source = Column(String(50), default="live")
    disclaimer = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
