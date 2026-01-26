from sqlalchemy import Column, Integer, Text, Numeric
from core.database import Base


class ParamSubscriptionPlan(Base):
    __tablename__ = "param_subscription_plans"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(Text, nullable=False, unique=True)
    min_users = Column(Integer, nullable=False)
    max_users = Column(Integer, nullable=False)
    scans_per_user_month = Column(Integer, nullable=False)
    dept_analyses_per_month = Column(Integer, nullable=False)
    org_analyses_per_month = Column(Integer, nullable=False)
    price_usd = Column(Numeric, nullable=False)