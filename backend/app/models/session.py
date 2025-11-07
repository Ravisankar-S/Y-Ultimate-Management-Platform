from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, nullable=True)  # future expansion
    coach_id = Column(Integer, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False)
    location = Column(String, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    notes = Column(Text, nullable=True)
    is_online = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    coach = relationship("Participant", foreign_keys=[coach_id])
    attendances = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")