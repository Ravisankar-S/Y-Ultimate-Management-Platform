from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class SessionBase(BaseModel):
    program_id: Optional[int] = None
    coach_id: Optional[int] = None
    date: date
    location: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    notes: Optional[str] = None
    is_online: Optional[bool] = False

class SessionCreate(SessionBase):
    pass

class SessionOut(SessionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
