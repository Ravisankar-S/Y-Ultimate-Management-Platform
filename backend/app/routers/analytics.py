from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.match import Match
from app.models.spirit_score import SpiritScore
from app.models.participant import Participant

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/overview")
def get_global_analytics(db: Session = Depends(get_db)):
    """Return global analytics across all tournaments."""
    total_tournaments = db.query(func.count(Tournament.id)).scalar()
    total_teams = db.query(func.count(Team.id)).scalar()
    total_matches = db.query(func.count(Match.id)).scalar()
    completed_matches = db.query(func.count(Match.id)).filter(Match.status == "completed").scalar()
    ongoing_matches = db.query(func.count(Match.id)).filter(Match.status == "ongoing").scalar()
    average_spirit = db.query(func.avg(SpiritScore.total)).scalar() or 0.0
    total_participants = db.query(func.count(Participant.id)).scalar()

    data = {
        "total_tournaments": total_tournaments,
        "total_teams": total_teams,
        "total_matches": total_matches,
        "completed_matches": completed_matches,
        "ongoing_matches": ongoing_matches,
        "average_spirit_score": round(float(average_spirit), 2),
        "total_participants": total_participants,
    }
    return {"scope": "global", "data": data}


@router.get("/tournaments/{tournament_id}")
def get_tournament_analytics(tournament_id: int, db: Session = Depends(get_db)):
    """Return analytics for a specific tournament."""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    team_count = db.query(func.count(Team.id)).filter(Team.tournament_id == tournament_id).scalar()
    matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()

    total_matches = len(matches)
    completed_matches = len([m for m in matches if m.status == "completed"]) # type: ignore
    ongoing_matches = len([m for m in matches if m.status == "ongoing"]) # type: ignore

    average_spirit = db.query(func.avg(SpiritScore.total)).join(Match).filter(
        Match.tournament_id == tournament_id
    ).scalar() or 0.0

    data = {
        "tournament_id": tournament_id,
        "tournament_title": tournament.title,
        "team_count": team_count,
        "total_matches": total_matches,
        "completed_matches": completed_matches,
        "ongoing_matches": ongoing_matches,
        "average_spirit_score": round(float(average_spirit), 2),
    }

    return {"scope": "tournament", "data": data}
