from core.database import Base
from sqlalchemy import Column, Date, DateTime, String
from sqlalchemy.dialects.postgresql import UUID


class User_profiles(Base):
    __tablename__ = "user_profiles"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(String, nullable=False)
    organization_id = Column(UUID(as_uuid=True), nullable=False)
    department_id = Column(UUID(as_uuid=True), nullable=True)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)