from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum

class ParticipantStatus(str, Enum):
    active = "active"
    transferred = "transferred"
    inactive = "inactive"

class ParticipantType(str, Enum):
    child = "child"
    coach = "coach"
    volunteer = "volunteer"
    admin = "admin"
    player = "player"
    other = "other"

class ParticipantBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    school: Optional[str] = None
    community: Optional[str] = None
    primary_contact: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    participant_type: Optional[ParticipantType] = ParticipantType.player
    current_status: Optional[ParticipantStatus] = ParticipantStatus.active


class ParticipantCreate(ParticipantBase):
    pass

class ParticipantOut(ParticipantBase):
    id: int

    class Config:
        orm_mode = True