from sqlalchemy import Column, Integer, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from core.database import Base


class AIAnalysisLog(Base):
    __tablename__ = "ai_analysis_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    analysis_type = Column(Text, nullable=True)
    openai_model = Column(Text, nullable=True)
    input_size_kb = Column(Numeric, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    cost_usd = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)