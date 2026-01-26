from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class Subscription_usage_logs(Base):
    __tablename__ = "subscription_usage_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    scan_type = Column(String, nullable=True)
    used_at = Column(DateTime(timezone=True), nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)