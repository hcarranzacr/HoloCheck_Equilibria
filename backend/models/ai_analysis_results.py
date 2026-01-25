from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID


class Ai_analysis_results(Base):
    __tablename__ = "ai_analysis_results"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(String, nullable=False)
    measurement_id = Column(UUID(as_uuid=True), nullable=True)
    department_id = Column(UUID(as_uuid=True), nullable=True)
    organization_id = Column(UUID(as_uuid=True), nullable=True)
    analysis_type = Column(String, nullable=False)
    interpretation = Column(String, nullable=True)
    recommendations = Column(ARRAY(String), nullable=True)
    alert_level = Column(String, nullable=True)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)