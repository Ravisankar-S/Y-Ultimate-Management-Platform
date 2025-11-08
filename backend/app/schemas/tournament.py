from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class TournamentBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    location: Optional[str] = None
    sponsor: Optional[str] = None
    fields_json: Optional[Any] = None
    banner_url: Optional[str] = None
    is_published: bool = True


class TournamentCreate(TournamentBase):
    pass

class TournamentOut(TournamentBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True