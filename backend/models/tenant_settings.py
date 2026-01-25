from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID


class Tenant_settings(Base):
    __tablename__ = "tenant_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    ai_enabled = Column(Boolean, nullable=True)
    ai_model = Column(String, nullable=True)
    visualization_enabled = Column(Boolean, nullable=True)
    custom_prompts_enabled = Column(Boolean, nullable=True)
    global_prompt_employee = Column(String, nullable=True)
    global_prompt_department = Column(String, nullable=True)
    global_prompt_organization = Column(String, nullable=True)
    reminder_frequency = Column(String, nullable=True)
    report_frequency = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)