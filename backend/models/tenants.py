from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID


class Tenants(Base):
    __tablename__ = "tenants"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, nullable=True)
    secondary_color = Column(String, nullable=True)
    locale = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    active = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)