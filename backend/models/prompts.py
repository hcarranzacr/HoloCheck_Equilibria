from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID


class Prompts(Base):
    __tablename__ = "prompts"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    organization_id = Column(UUID(as_uuid=True), nullable=True)
    target = Column(String, nullable=False)
    prompt_text = Column(String, nullable=False)
    model_version = Column(String, nullable=True)
    active = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)