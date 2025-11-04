from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class SpiritScore(Base):
    __tablename__ = "spirit_scores"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    from_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    to_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)

    # Categories (0–4)
    rules_knowledge = Column(Integer, default=2)
    fouls_body_contact = Column(Integer, default=2)
    fair_mindedness = Column(Integer, default=2)
    positive_attitude = Column(Integer, default=2)
    communication = Column(Integer, default=2)

    total = Column(Integer, default=10)
    comments = Column(Text, nullable=True)
    submitted_by = Column(Integer, ForeignKey("participants.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    match = relationship("Match", back_populates="spirit_scores")
    from_team = relationship("Team", foreign_keys=[from_team_id])
    to_team = relationship("Team", foreign_keys=[to_team_id])


