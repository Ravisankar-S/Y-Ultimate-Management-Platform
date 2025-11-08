# app/schemas/team_member.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TeamMemberBase(BaseModel):
    team_id: int = Field(..., description="Team this member belongs to")
    participant_id: int = Field(..., description="Linked participant ID")
    role: Optional[str] = Field("player", description="Role of member in team (player/captain/etc.)")
    jersey_number: Optional[str] = Field(None, description="Player's jersey number")
    is_active: Optional[bool] = True


class TeamMemberCreate(TeamMemberBase):
    """Used for adding a participant to a team roster."""
    pass


class TeamMemberUpdate(BaseModel):
    """Used for updating jersey, role, or active status."""
    role: Optional[str] = None
    jersey_number: Optional[str] = None
    is_active: Optional[bool] = None


class TeamMemberOut(TeamMemberBase):
    """Response model"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
