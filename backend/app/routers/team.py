from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.routers.auth import get_db
from app.models.team import Team, TeamStatus
from app.models.tournament import Tournament
from app.schemas.team import TeamCreate, TeamOut
from typing import List
from app.routers.auth import get_current_user
from app.core.rate_limits import frequent_action_limiter
from app.core.cache_utils import invalidate_tournament_analytics

router = APIRouter(prefix="/tournaments", tags=["Teams"])

@router.post("/{tournament_id}/teams/", response_model=TeamOut, dependencies=[Depends(frequent_action_limiter)])
async def register_team(
    tournament_id: int,
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    existing_team = db.query(Team).filter(
        Team.tournament_id == tournament_id,
        func.lower(Team.name) == func.lower(team.name)
    ).first()

    if existing_team:
        raise HTTPException(
            status_code=400,
            detail=f"A team named '{team.name}' already exists in this tournament."
        )

    new_team = Team(
        name=team.name,
        tournament_id=tournament.id,
        manager_participant_id=team.manager_participant_id
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    await invalidate_tournament_analytics(tournament_id)
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
async def approve_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team.status = TeamStatus.approved # type: ignore
    tournament_id = team.tournament_id
    db.commit()
    db.refresh(team)
    await invalidate_tournament_analytics(tournament_id) # type: ignore
    return team


@router.delete("/teams/{team_id}", status_code=204, dependencies=[Depends(frequent_action_limiter)])
async def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    tournament_id = team.tournament_id
    db.delete(team)
    db.commit()
    await invalidate_tournament_analytics(tournament_id) # type: ignore
    return None