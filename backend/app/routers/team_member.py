from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models.team_member import TeamMember
from app.models.team import Team
from app.models.participant import Participant
from app.schemas.team_member import TeamMemberCreate, TeamMemberOut
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/teams", tags=["Team Members"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{team_id}/roster", response_model=List[TeamMemberOut])
def add_team_members(
    team_id: int,
    members: List[TeamMemberCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    created_members = []
    for member_data in members:
        participant = db.query(Participant).filter(Participant.id == member_data.participant_id).first()
        if not participant:
            raise HTTPException(status_code=404, detail=f"Participant {member_data.participant_id} not found")

        new_member = TeamMember(
            team_id=team_id,
            participant_id=participant.id,
            role=member_data.role,
            jersey_number=member_data.jersey_number,
            is_active=member_data.is_active
        )
        db.add(new_member)
        created_members.append(new_member)

    db.commit()
    for m in created_members:
        db.refresh(m)
    return created_members


@router.get("/{team_id}/roster", response_model=List[TeamMemberOut])
def get_team_roster(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    roster = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    return roster
