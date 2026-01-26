from sqlalchemy import Column, Integer, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.database import Base


class OrganizationSubscription(Base):
    __tablename__ = "organization_subscriptions"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    
    # Main relationship
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, unique=True)
    subscription_plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=False)
    
    # Validity period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    
    # Plan limits (copied at subscription time)
    scan_limit_per_user_per_month = Column(Integer, nullable=False, default=2)
    dept_analysis_limit = Column(Integer, nullable=False, default=1)
    org_analysis_limit = Column(Integer, nullable=False, default=1)
    max_users_allowed = Column(Integer, nullable=True)
    
    # Monthly consumption control
    used_scans_total = Column(Integer, nullable=False, default=0)
    used_dept_analyses = Column(Integer, nullable=False, default=0)
    used_org_analyses = Column(Integer, nullable=False, default=0)
    
    # Monthly cycle
    current_month = Column(Date, nullable=False)
    monthly_reset_day = Column(Integer, nullable=False, default=1)
    last_reset = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Operational flags
    allow_employee_ai_feedback = Column(Boolean, nullable=False, default=True)
    enable_branding = Column(Boolean, nullable=False, default=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)