from sqlalchemy import Column, Integer, ForeignKey, Date, Text, JSON, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class LSASAssessment(Base):
    __tablename__ = "lsas_assessments"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    assessor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False)

    scores_json = Column(JSON, nullable=True)
    total_score = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participant = relationship("Participant", foreign_keys=[participant_id])
