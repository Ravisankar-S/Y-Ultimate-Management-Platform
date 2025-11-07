from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import date, datetime

class LSASAssessmentBase(BaseModel):
    participant_id: int
    assessor_id: Optional[int] = None
    date: date
    scores_json: Optional[Dict[str, float]] = Field(default_factory=dict)
    total_score: Optional[float] = 0.0
    notes: Optional[str] = None

class LSASAssessmentCreate(LSASAssessmentBase):
    pass

class LSASAssessmentOut(LSASAssessmentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
