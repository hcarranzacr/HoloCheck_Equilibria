from core.database import Base
from sqlalchemy import Column, DateTime, Float, String
from sqlalchemy.dialects.postgresql import JSONB, UUID


class Biometric_measurements(Base):
    __tablename__ = "biometric_measurements"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(String, nullable=False)
    measurement_id = Column(String, nullable=False)
    heart_rate = Column(Float, nullable=True)
    respiration_rate = Column(Float, nullable=True)
    bp_systolic = Column(Float, nullable=True)
    bp_diastolic = Column(Float, nullable=True)
    sdnn = Column(Float, nullable=True)
    rmssd = Column(Float, nullable=True)
    ai_stress = Column(Float, nullable=True)
    ai_fatigue = Column(Float, nullable=True)
    ai_cognitive_load = Column(Float, nullable=True)
    ai_recovery = Column(Float, nullable=True)
    mental_score = Column(Float, nullable=True)
    bio_age_basic = Column(Float, nullable=True)
    cvd_risk = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    vital_score = Column(Float, nullable=True)
    physio_score = Column(Float, nullable=True)
    risks_score = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    raw_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)