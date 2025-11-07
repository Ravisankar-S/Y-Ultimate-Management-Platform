from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: int
    type: str
    payload_json: Optional[dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationOut(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True