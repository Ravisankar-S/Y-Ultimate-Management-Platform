from sqlalchemy import Column, Integer, ForeignKey, Date, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class HomeVisit(Base):
    __tablename__ = "home_visits"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    coach_id = Column(Integer, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True)
    visit_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    photos_json = Column(Text, nullable=True)  # store URLs or file refs

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    participant = relationship("Participant", foreign_keys=[participant_id])
    coach = relationship("Participant", foreign_keys=[coach_id])
