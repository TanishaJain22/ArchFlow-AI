from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from db.database import Base

class DesignHistory(Base):
    __tablename__ = "design_history"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text, nullable=False)
    mode = Column(String(50), nullable=True)
    architecture = Column(JSONB, nullable=False)
    metrics = Column(JSONB, nullable=False)
    diagram = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
