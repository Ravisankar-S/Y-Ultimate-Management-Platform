from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class AttendanceBase(BaseModel):
    participant_id: int
    session_id: Optional[int] = None
    tournament_id: Optional[int] = None
    date: date
    present: bool
    marked_by: Optional[int] = None
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceOut(AttendanceBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True