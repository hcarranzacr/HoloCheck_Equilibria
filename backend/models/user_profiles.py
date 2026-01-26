from core.database import Base
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class UserProfile(Base):
    __tablename__ = "user_profiles"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)