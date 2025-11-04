from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from app.db.session import Base
import enum

class TeamStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"))
    manager_participant_id = Column(Integer, ForeignKey("participants.id", ondelete="SET NULL"))
    status = Column(Enum(TeamStatus), default=TeamStatus.pending)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tournament = relationship("Tournament", back_populates="teams")
    manager = relationship("Participant", foreign_keys=[manager_participant_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")