from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Boolean, JSON
from app.db.session import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String, nullable=False)
    payload_json = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())