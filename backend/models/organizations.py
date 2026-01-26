from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from core.database import Base


class Organizations(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String, nullable=False)
    sector_id = Column(Integer, ForeignKey("param_sectors.id"), nullable=True)
    industry_id = Column(Integer, ForeignKey("param_industries.id"), nullable=True)
    logo_url = Column(Text, nullable=True)
    brand_slogan = Column(Text, nullable=True)
    welcome_message = Column(Text, nullable=True)
    subscription_plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=True)