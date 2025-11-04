from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base
import enum

class MatchStatus(str, enum.Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    completed = "completed"

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"))

    # Optional: field info for multi-field tournaments
    field_id = Column(String, nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    # 2-teams
    team_a_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    team_b_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))

    # Scores
    score_a = Column(Integer, default=0)
    score_b = Column(Integer, default=0)
    status = Column(Enum(MatchStatus), default=MatchStatus.scheduled)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    team_a = relationship("Team", foreign_keys=[team_a_id])
    team_b = relationship("Team", foreign_keys=[team_b_id])
    spirit_scores = relationship("SpiritScore", back_populates="match", cascade="all, delete-orphan")