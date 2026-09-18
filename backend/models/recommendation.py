import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from core.database import Base


class KOLRecommendationModel(Base):
    """Stores explainable multi-factor KOL recommendation results and audit trails."""
    __tablename__ = "kol_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_identifier = Column(String(255), index=True, nullable=False)
    kol_username = Column(String(100), index=True, nullable=False)
    rank = Column(Integer, nullable=False)
    final_score = Column(Float, nullable=False, index=True)
    semantic_relevance_score = Column(Float, nullable=False)
    engagement_quality_score = Column(Float, nullable=False)
    local_content_relevance_score = Column(Float, nullable=False)
    audience_fit_proxy = Column(Float, nullable=True)
    brand_safety_score = Column(Float, nullable=False)
    brand_safety_risk_level = Column(String(50), nullable=False, default="safe")
    data_quality_score = Column(Float, nullable=False)
    score_breakdown = Column(JSON, default=dict)
    reasons = Column(JSON, default=list)
    cautions = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
