from sqlalchemy import Column, Integer, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    name = Column(Text, nullable=False)
    slot_range = Column(Text, nullable=False)
    scan_limit_per_user_per_month = Column(Integer, nullable=False)
    dept_analysis_limit = Column(Integer, nullable=False)
    org_analysis_limit = Column(Integer, nullable=False)
    price = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)