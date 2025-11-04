from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import SessionLocal
from app.models.match import Match
from app.models.tournament import Tournament
from app.models.team import Team
from app.schemas.match import MatchCreate, MatchOut, MatchUpdate, MatchScoreUpdate
from app.core.redis import publish
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/matches", tags=["Matches"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=MatchOut)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tournament = db.query(Tournament).filter(Tournament.id == match_data.tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if both teams exist in the same tournament
    for team_id in [match_data.team_a_id, match_data.team_b_id]:
        team = db.query(Team).filter(Team.id == team_id, Team.tournament_id == tournament.id).first()
        if not team:
            raise HTTPException(status_code=404, detail=f"Team {team_id} not found in tournament")

    new_match = Match(**match_data.model_dump())
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    return new_match


@router.get("/", response_model=List[MatchOut])
def list_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    matches = db.query(Match).all()
    return matches


@router.get("/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.patch("/{match_id}/score", response_model=MatchOut)
async def update_score(
    match_id: int,
    score_data: MatchScoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.score_a = score_data.score_a # type: ignore
    match.score_b = score_data.score_b # type: ignore
    match.status = score_data.status # type: ignore
    db.commit()
    db.refresh(match)

    # Publish live update to Redis
    await publish(f"live:match:{match_id}", {
    "match_id": match_id,
    "score_a": match.score_a,
    "score_b": match.score_b,
    "status": match.status
})

    return match
