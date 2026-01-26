from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class Biometric_measurements(Base):
    __tablename__ = "biometric_measurements"
    __table_args__ = {"extend_existing": True}

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    
    # Foreign key to user_profiles
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=False)
    
    # Indicadores vitales y fisiológicos
    heart_rate = Column(Float, nullable=True)
    sdnn = Column(Float, nullable=True)
    rmssd = Column(Float, nullable=True)
    ai_stress = Column(Float, nullable=True)
    ai_fatigue = Column(Float, nullable=True)
    ai_cognitive_load = Column(Float, nullable=True)
    ai_recovery = Column(Float, nullable=True)
    bio_age_basic = Column(Float, nullable=True)
    
    # Nuevos indicadores DeepAffex
    vital_index_score = Column(Float, nullable=True)
    physiological_score = Column(Float, nullable=True)
    mental_score = Column(Float, nullable=True)
    wellness_index_score = Column(Float, nullable=True)
    mental_stress_index = Column(Float, nullable=True)
    cardiac_load = Column(Float, nullable=True)
    vascular_capacity = Column(Float, nullable=True)
    cv_risk_heart_attack = Column(Float, nullable=True)
    cv_risk_stroke = Column(Float, nullable=True)
    
    # Composición corporal
    bmi = Column(Float, nullable=True)
    abdominal_circumference_cm = Column(Float, nullable=True)
    waist_height_ratio = Column(Float, nullable=True)
    body_shape_index = Column(Float, nullable=True)
    
    # Indicadores técnicos
    arrhythmias_detected = Column(Integer, nullable=True)
    signal_to_noise_ratio = Column(Float, nullable=True)
    scan_quality_index = Column(Float, nullable=True)
    global_health_score = Column(Float, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), nullable=True)