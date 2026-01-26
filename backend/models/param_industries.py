from sqlalchemy import Column, Integer, Text
from core.database import Base


class ParamIndustry(Base):
    __tablename__ = "param_industries"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(Text, nullable=False, unique=True)