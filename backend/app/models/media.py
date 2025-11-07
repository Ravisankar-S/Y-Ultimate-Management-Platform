from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Boolean
from app.db.session import Base

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)   # path or external URL
    mime = Column(String, nullable=True)
    caption = Column(String, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
