from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from core.database import Base


class Recommendation(Base):
    """Recommendations model - stores AI-generated health recommendations for users"""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # CRITICAL: Use String to match user_profiles.user_id
    user_id = Column(String, ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    
    # Recommendation details
    measurement_id = Column(String, nullable=True)
    analysis_type = Column(String, nullable=False)  # e.g., "stress", "fatigue", "recovery"
    recommendation_text = Column(Text, nullable=False)
    priority = Column(String, nullable=True)  # e.g., "high", "medium", "low"
    category = Column(String, nullable=True)  # e.g., "lifestyle", "exercise", "nutrition"
    
    # Status tracking
    status = Column(String, default="active", nullable=False)  # active, completed, dismissed
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationship
    user_profile = relationship("UserProfile", foreign_keys=[user_id], backref="recommendations")