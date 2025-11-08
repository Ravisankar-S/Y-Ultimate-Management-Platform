from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SpiritScoreBase(BaseModel):
    match_id: int
    from_team_id: int
    to_team_id: int
    rules_knowledge: int = Field(2, ge=0, le=4)
    fouls_body_contact: int = Field(2, ge=0, le=4)
    fair_mindedness: int = Field(2, ge=0, le=4)
    positive_attitude: int = Field(2, ge=0, le=4)
    communication: int = Field(2, ge=0, le=4)
    comments: Optional[str] = None
    submitted_by: Optional[int] = None  # participant_id

class SpiritScoreCreate(SpiritScoreBase):
    """Schema for incoming spirit score submissions"""
    pass

class SpiritScoreOut(SpiritScoreBase):
    """Schema for returning spirit score records"""
    id: int
    total: int
    created_at: datetime

    class Config:
        from_attributes = True
