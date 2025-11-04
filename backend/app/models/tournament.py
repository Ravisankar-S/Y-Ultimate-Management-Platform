from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime
from sqlalchemy import DateTime

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    location = Column(String, nullable=True)
    sponsor = Column(String, nullable=True)

    fields_json = Column(JSON, nullable=True)

    banner_url = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="tournaments")
    teams = relationship("Team", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
