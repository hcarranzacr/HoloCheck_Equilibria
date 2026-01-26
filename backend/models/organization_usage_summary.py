from sqlalchemy import Column, Integer, BigInteger, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.database import Base


class OrganizationUsageSummary(Base):
    __tablename__ = "organization_usage_summary"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    month = Column(Date, nullable=False)
    
    # Consumos agregados
    total_ai_tokens_used = Column(BigInteger, default=0)
    total_scans = Column(Integer, default=0)
    total_prompts_used = Column(Integer, default=0)
    
    # Nuevos campos para control granular
    total_user_scans = Column(Integer, default=0)
    total_valid_scans = Column(Integer, default=0)
    total_invalid_scans = Column(Integer, default=0)
    total_biometric_scans = Column(Integer, default=0)
    total_voice_scans = Column(Integer, default=0)
    scan_limit_reached = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)