"""
Organizations model
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from core.database import Base


class Organizations(Base):
    """Organizations table model"""
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    size = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OrganizationBranding(Base):
    """Organization branding configuration table model"""
    __tablename__ = "organization_branding"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, nullable=False, index=True)
    logo_url = Column(String)
    primary_color = Column(String)
    secondary_color = Column(String)
    font_family = Column(String)
    custom_css = Column(Text)
    theme_settings = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())