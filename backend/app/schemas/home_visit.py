from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class HomeVisitBase(BaseModel):
    participant_id: int
    coach_id: Optional[int] = None
    visit_date: date
    notes: Optional[str] = None
    photos_json: Optional[str] = None  # URLs or file references

class HomeVisitCreate(HomeVisitBase):
    pass

class HomeVisitOut(HomeVisitBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
