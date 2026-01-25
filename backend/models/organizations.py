from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from core.database import Base


class Organizations(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    sector_id = Column(Integer, ForeignKey("param_sectors.id"))
    industry_id = Column(Integer, ForeignKey("param_industries.id"))
    subscription_plan_id = Column(Integer, ForeignKey("param_subscription_plans.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrganizationBranding(Base):
    __tablename__ = "organization_branding"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, unique=True)
    
    # Basic branding
    logo_url = Column(Text)
    primary_color = Column(String)
    slogan = Column(Text)
    message = Column(Text)
    slug = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Extended branding fields
    secondary_color = Column(String)
    favicon_url = Column(Text)
    font_family = Column(String)
    background_image_url = Column(Text)
    login_message = Column(Text)
    dashboard_welcome_text = Column(Text)
    meta_description = Column(Text)
    contact_email = Column(String)
    contact_phone = Column(String)
    social_links = Column(JSON)
    custom_terms_url = Column(Text)
    custom_privacy_url = Column(Text)
    login_layout_style = Column(String, default='centered')
    branding_mode = Column(String, default='custom')