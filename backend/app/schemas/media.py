from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaCreate(BaseModel):
    caption: Optional[str] = None
    is_public: Optional[bool] = True

class MediaOut(BaseModel):
    id: int
    tournament_id: Optional[int] = None
    match_id: Optional[int] = None
    uploader_id: Optional[int] = None
    filename: str
    url: str
    mime: Optional[str] = None
    caption: Optional[str] = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True
