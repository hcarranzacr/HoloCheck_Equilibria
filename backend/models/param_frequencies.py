from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base
import uuid


class ParamFrequency(Base):
    __tablename__ = "param_frequencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    label = Column(String, nullable=False)
    interval_days = Column(Integer, nullable=False)