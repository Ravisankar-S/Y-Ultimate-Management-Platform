from sqlalchemy import Column, Integer, Boolean, Date, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=True)

    date = Column(Date, nullable=False)
    present = Column(Boolean, default=False)
    marked_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participant = relationship("Participant")
    session = relationship("Session", back_populates="attendances")
