import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON
from core.database import Base


class KOLSemanticMatchModel(Base):
    """Audit log tracking semantic similarity calculations between brands and KOL candidates."""
    __tablename__ = "kol_semantic_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_identifier = Column(String(255), index=True, nullable=False)
    kol_candidate_id = Column(String(36), index=True, nullable=True)
    kol_username = Column(String(100), index=True, nullable=False)
    cosine_similarity = Column(Float, nullable=False)
    semantic_relevance_score = Column(Float, nullable=False)
    matching_topics = Column(JSON, default=list)
    embedding_model = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
