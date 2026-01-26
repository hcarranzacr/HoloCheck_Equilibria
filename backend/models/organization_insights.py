from sqlalchemy import Column, Integer, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.database import Base


class OrganizationInsight(Base):
    __tablename__ = "organization_insights"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    analysis_date = Column(Date, nullable=True)
    total_employees = Column(Integer, nullable=True)
    stress_index = Column(Numeric, nullable=True)
    burnout_risk = Column(Numeric, nullable=True)
    sleep_index = Column(Numeric, nullable=True)
    actuarial_risk = Column(Numeric, nullable=True)
    claim_risk = Column(Numeric, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)