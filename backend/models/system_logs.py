from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from datetime import datetime
from core.database import Base


class System_logs(Base):
    __tablename__ = "system_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=True)
    role = Column(String, nullable=True)
    log_type = Column(String, nullable=False)
    severity = Column(String, nullable=True)
    source = Column(String, nullable=True)
    module = Column(String, nullable=True)
    action = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    payload = Column(JSONB, nullable=True)
    route = Column(String, nullable=True)
    browser = Column(String, nullable=True)
    device = Column(String, nullable=True)
    ip_address = Column(INET, nullable=True)
    environment = Column(String, default='production')
    correlation_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


# Alias for backward compatibility
SystemLog = System_logs