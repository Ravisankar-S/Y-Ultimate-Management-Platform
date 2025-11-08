# app/schemas/match.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.spirit_score import SpiritScoreOut

class MatchBase(BaseModel):
    tournament_id: Optional[int] = None
    field_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    team_a_id: Optional[int] = None
    team_b_id: Optional[int] = None
    score_a: Optional[int] = 0
    score_b: Optional[int] = 0
    status: Optional[str] = "scheduled"

class MatchCreate(MatchBase):
    tournament_id: int # type: ignore
    team_a_id: int # type: ignore
    team_b_id: int # type: ignore

class MatchUpdate(BaseModel):
    field_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    status: Optional[str] = None

class MatchOut(MatchBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    spirit_scores: Optional[List[SpiritScoreOut]] = []  # nested output

class MatchScoreUpdate(BaseModel):
    """Used for updating match scores mid-game or after."""
    score_a: int
    score_b: int
    status: Optional[str] = "ongoing"

    class Config:
        from_attributes = True
