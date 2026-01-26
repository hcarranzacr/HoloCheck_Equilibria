from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
from core.database import Base


class OrganizationBranding(Base):
    __tablename__ = "organization_branding"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, unique=True)
    
    # Basic branding
    logo_url = Column(Text, nullable=True)
    primary_color = Column(String, nullable=True)
    slogan = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
    slug = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Extended branding fields
    secondary_color = Column(String, nullable=True)
    favicon_url = Column(Text, nullable=True)
    font_family = Column(String, nullable=True)
    background_image_url = Column(Text, nullable=True)
    login_message = Column(Text, nullable=True)
    dashboard_welcome_text = Column(Text, nullable=True)
    meta_description = Column(Text, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    social_links = Column(JSONB, nullable=True)
    custom_terms_url = Column(Text, nullable=True)
    custom_privacy_url = Column(Text, nullable=True)
    login_layout_style = Column(String, default='centered')
    branding_mode = Column(String, default='custom')