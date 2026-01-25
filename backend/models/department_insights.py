from core.database import Base
from sqlalchemy import Column, Date, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID


class Department_insights(Base):
    __tablename__ = "department_insights"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(String, nullable=False)
    department_id = Column(UUID(as_uuid=True), nullable=False)
    period_start = Column(Date, nullable=True)
    period_end = Column(Date, nullable=True)
    avg_health_score = Column(Float, nullable=True)
    avg_stress = Column(Float, nullable=True)
    avg_recovery = Column(Float, nullable=True)
    participation_rate = Column(Float, nullable=True)
    high_risk_count = Column(Integer, nullable=True)
    summary = Column(String, nullable=True)
    recommendations = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)