from sqlalchemy import Column, String
from models.base import Base


class ParamRole(Base):
    __tablename__ = "param_roles"

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)