from core.database import Base
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class Department_insights(Base):
    __tablename__ = "department_insights"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    summary = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)