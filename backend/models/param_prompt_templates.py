from sqlalchemy import Column, String, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base
import uuid


class ParamPromptTemplate(Base):
    __tablename__ = "param_prompt_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scope = Column(String, CheckConstraint("scope IN ('employee', 'org')"))
    type = Column(String)
    content = Column(String, nullable=False)