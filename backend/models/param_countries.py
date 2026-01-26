from sqlalchemy import Column, String
from models.base import Base


class ParamCountry(Base):
    __tablename__ = "param_countries"

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)