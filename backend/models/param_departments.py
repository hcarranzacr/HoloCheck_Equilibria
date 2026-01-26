from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base
import uuid


class ParamDepartment(Base):
    __tablename__ = "param_departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)