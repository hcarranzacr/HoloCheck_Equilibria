from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from core.database import Base


class Biometric_measurements(Base):
    """Biometric measurements model - stores user health metrics"""
    __tablename__ = "biometric_measurements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # CRITICAL FIX: Change user_id from UUID to String to match user_profiles.user_id
    user_id = Column(String, ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    
    # Identificador único de medición
    measurement_id = Column(String, nullable=False, unique=True, index=True)
    
    # Indicadores vitales y fisiológicos
    heart_rate = Column(Float, nullable=True)
    sdnn = Column(Float, nullable=True)
    rmssd = Column(Float, nullable=True)
    respiration_rate = Column(Float, nullable=True)
    bp_systolic = Column(Float, nullable=True)
    bp_diastolic = Column(Float, nullable=True)
    
    # Indicadores de IA
    ai_stress = Column(Float, nullable=True)
    ai_fatigue = Column(Float, nullable=True)
    ai_cognitive_load = Column(Float, nullable=True)
    ai_recovery = Column(Float, nullable=True)
    
    # Scores compuestos
    mental_score = Column(Float, nullable=True)
    bio_age_basic = Column(Float, nullable=True)
    cvd_risk = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    vital_score = Column(Float, nullable=True)
    physio_score = Column(Float, nullable=True)
    risks_score = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    
    # Raw data storage
    raw_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user_profile = relationship("UserProfile", foreign_keys=[user_id], backref="biometric_measurements")