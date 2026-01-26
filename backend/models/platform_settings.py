from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint
from models.base import Base
from datetime import datetime


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
    description = Column(String)
    data_type = Column(String, CheckConstraint("data_type IN ('boolean', 'integer', 'text', 'json', 'enum')"), nullable=False)
    is_editable = Column(Boolean, default=True)
    scope = Column(String, CheckConstraint("scope IN ('global', 'tenant')"), default='global')
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)