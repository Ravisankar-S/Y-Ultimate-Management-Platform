from sqlalchemy import Column, Integer, String, Enum, Date, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class ParticipantStatus(str, enum.Enum):
    active = "active"
    transferred = "transferred"
    inactive = "inactive"

class ParticipantType(str, enum.Enum):
    child = "child"
    coach = "coach"
    volunteer = "volunteer"
    admin = "admin"
    player = "player"
    other = "other"

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    dob = Column(Date, nullable=True)
    school = Column(String, nullable=True)
    community = Column(String, nullable=True)
    current_status = Column(Enum(ParticipantStatus), default=ParticipantStatus.active)
    participant_type = Column(Enum(ParticipantType), default=ParticipantType.child)
    primary_contact = Column(String, nullable=True)
    address = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="participant", foreign_keys=[user_id], uselist=False)

    coach_id = Column(Integer, ForeignKey("participants.id"), nullable=True)
    coach = relationship("Participant", remote_side=[id], back_populates="trainees") # type: ignore
    trainees = relationship("Participant", back_populates="coach", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )