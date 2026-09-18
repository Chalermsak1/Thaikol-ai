import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON
from core.database import Base


class BrandModel(Base):
    __tablename__ = "brands"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=True)
    website_url = Column(String(512), nullable=True)
    facebook_url = Column(String(512), nullable=True)
    country = Column(String(10), default="TH")

    brand_summary = Column(Text, nullable=True)
    target_audience = Column(Text, nullable=True)
    key_products = Column(JSON, default=list)
    content_style = Column(Text, nullable=True)
    keywords = Column(JSON, default=list)

    is_demo_fixture = Column(Boolean, default=False)
    provenance = Column(String(50), default="live")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
