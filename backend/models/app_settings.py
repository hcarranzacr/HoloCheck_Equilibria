from core.database import Base
from sqlalchemy import Column, Integer, String


class App_settings(Base):
    __tablename__ = "app_settings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    setting_key = Column(String, nullable=True, unique=True)
    setting_value = Column(String, nullable=True)