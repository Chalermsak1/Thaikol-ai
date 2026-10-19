import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from core.database import Base


class MatchingRunModel(Base):
    """Stores telemetry, pipeline stages, and results of asynchronous matching runs."""
    __tablename__ = "matching_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_name = Column(String(255), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="queued", index=True)
    stage = Column(String(50), nullable=False, default="queued")
    progress_percent = Column(Integer, nullable=False, default=0)
    stage_message = Column(Text, nullable=True)
    candidate_count = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)
    result = Column(JSON, nullable=True)
    request_payload = Column(JSON, nullable=True)
