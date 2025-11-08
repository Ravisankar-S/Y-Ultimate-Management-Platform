from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routers.auth import get_db
from app.models.team import Team, TeamStatus
from app.models.tournament import Tournament
from app.schemas.team import TeamCreate, TeamOut
from typing import List
from app.routers.auth import get_current_user
from app.core.rate_limits import frequent_action_limiter

router = APIRouter(prefix="/tournaments", tags=["Teams"])

@router.post("/{tournament_id}/teams/", response_model=TeamOut, dependencies=[Depends(frequent_action_limiter)])
def register_team(
    tournament_id: int,
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    new_team = Team(
        name=team.name,
        tournament_id=tournament.id,
        manager_participant_id=team.manager_participant_id
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team

@router.get("/{tournament_id}/teams/", response_model=List[TeamOut], dependencies=[Depends(frequent_action_limiter)])
def list_teams(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    teams = db.query(Team).filter(Team.tournament_id == tournament_id).all()
    return teams

@router.patch("/teams/{team_id}/approve", response_model=TeamOut, dependencies=[Depends(frequent_action_limiter)])
def approve_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team.status = TeamStatus.approved # type: ignore
    db.commit()
    db.refresh(team)
    return team