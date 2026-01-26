from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class Prompts(Base):
    __tablename__ = "prompts"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    target = Column(String, nullable=True)
    prompt_text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)
    prompt_type = Column(String, nullable=True)
    audience = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    language = Column(String, nullable=True)
    content = Column(String, nullable=True)
    active = Column(Boolean, nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)
    prompt_template_id = Column(UUID(as_uuid=True), ForeignKey("param_prompt_templates.id"), nullable=True)