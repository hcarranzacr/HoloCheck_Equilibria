from core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID


class Ai_analysis_results(Base):
    __tablename__ = "ai_analysis_results"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    measurement_id = Column(UUID(as_uuid=True), ForeignKey("biometric_measurements.id"), nullable=True)
    insight_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)