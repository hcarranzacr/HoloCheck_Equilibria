from sqlalchemy import Column, Integer, Text
from core.database import Base


class ParamSector(Base):
    __tablename__ = "param_sectors"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(Text, nullable=False, unique=True)