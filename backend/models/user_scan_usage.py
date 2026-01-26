from sqlalchemy import Column, String, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base
from datetime import datetime, date
import uuid


class UserScanUsage(Base):
    __tablename__ = "user_scan_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.user_id'), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    scan_date = Column(Date, nullable=False, default=date.today)
    scan_type = Column(String, default='biometric')
    session_id = Column(String)
    valid = Column(Boolean, default=True)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)