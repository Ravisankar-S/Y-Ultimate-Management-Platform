from pydantic import BaseModel
from typing import List, Optional
from  datetime import datetime
from enum import Enum

class TeamStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class TeamBase(BaseModel):
    name: str
    tournament_id: int
    manager_participant_id: Optional[int] = None

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int
    status: TeamStatus
    created_at: datetime

    class Config:
        orm_mode = True