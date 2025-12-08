from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json
from collections import defaultdict

from app.db.session import SessionLocal
from app.models.match import Match, MatchStatus
from app.models.tournament import Tournament
from app.models.team import Team, TeamStatus
from app.models.spirit_score import SpiritScore
from app.schemas.match import (
    MatchCreate,
    MatchOut,
    MatchUpdate,
    MatchScoreUpdate,
    TournamentScheduleOut,
)
from app.core.redis import publish
from app.routers.auth import get_current_user
from app.models.user import User
from app.core.deps import require_roles
from app.core.rate_limits import frequent_action_limiter
from app.core.cache_utils import invalidate_tournament_analytics
from loguru import logger

router = APIRouter(prefix="/matches", tags=["Matches"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=MatchOut,
    dependencies=[Depends(frequent_action_limiter), Depends(require_roles("admin", "manager"))],
)
async def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Creating match: Tournament {match_data.tournament_id}, Team {match_data.team_a_id} vs {match_data.team_b_id}")
    tournament = db.query(Tournament).filter(Tournament.id == match_data.tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Check if both teams exist in the same tournament and are approved
    for team_id in [match_data.team_a_id, match_data.team_b_id]:
        team = db.query(Team).filter(Team.id == team_id, Team.tournament_id == tournament.id).first()
        if not team:
            raise HTTPException(status_code=404, detail=f"Team {team_id} not found in tournament")
        if team.status != TeamStatus.approved:
            raise HTTPException(status_code=400, detail=f"Team {team_id} is not approved for matches")

    new_match = Match(**match_data.model_dump())
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    logger.success(f"Match {new_match.id} created")
    await invalidate_tournament_analytics(match_data.tournament_id)
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


@router.patch("/{match_id}/score", response_model=MatchOut, dependencies=[Depends(frequent_action_limiter)])
async def update_score(
    match_id: int,
    score_data: MatchScoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Updating score for match {match_id}: {score_data.score_a}-{score_data.score_b}")
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.score_a = score_data.score_a # type: ignore
    match.score_b = score_data.score_b # type: ignore
    match.status = score_data.status # type: ignore
    tournament_id = match.tournament_id
    db.commit()
    db.refresh(match)

    # Publish live update to Redis
    await publish(f"live:match:{match_id}", {
    "match_id": match_id,
    "score_a": match.score_a,
    "score_b": match.score_b,
    "status": match.status
})

    logger.success(f"Match {match_id} score updated and broadcast")
    await invalidate_tournament_analytics(tournament_id) # type: ignore
    return match


@router.delete("/{match_id}", status_code=204, dependencies=[Depends(frequent_action_limiter)])
async def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    tournament_id = match.tournament_id
    db.delete(match)
    db.commit()
    logger.info(f"Match {match_id} deleted")
    await invalidate_tournament_analytics(tournament_id) # type: ignore
    return None

@router.post(
    "/tournaments/{tournament_id}/generate-matches",
    response_model=List[MatchOut],
    dependencies=[Depends(require_roles("admin", "manager"))],
)
def generate_matches(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    teams = (
        db.query(Team)
        .filter(Team.tournament_id == tournament_id, Team.status == TeamStatus.approved)
        .all()
    )
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="At least two approved teams required")
    
    existing_matches = db.query(Match).filter(Match.tournament_id == tournament_id).count()
    if existing_matches > 0:
        raise HTTPException(status_code=400, detail="Matches have already been generated for this tournament")
    
    try:
        fields = json.loads(tournament.fields_json) if tournament.fields_json else [] # type: ignore
    except Exception:
        fields = [tournament.fields_json] if tournament.fields_json else [] # type: ignore

    if not fields:
        fields = ["Field A", "Field B"]

    start_date = tournament.start_date or datetime.utcnow().date()
    start_time = datetime.combine(start_date, datetime.min.time()) + timedelta(hours=9)  # type: ignore # 9 AM start
    time_gap = timedelta(minutes=60)  # 1 hour per match

    new_matches = []
    field_index = 0

    for i in range(len(teams)):
        for j in range(i + 1, len(teams)):
            field_id = fields[field_index % len(fields)]
            match = Match (
                tournament_id=tournament_id,
                team_a_id=teams[i].id,
                team_b_id=teams[j].id,
                field_id=field_id,
                start_time=start_time,
                status=MatchStatus.scheduled
            )
            db.add(match)
            new_matches.append(match)

            field_index += 1
            start_time += time_gap

    db.commit()

    for m in new_matches:
        db.refresh(m)

    return new_matches

@router.get("/tournaments/{tournament_id}/schedule", response_model=TournamentScheduleOut)
def get_tournament_schedule(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    matches = (
        db.query(Match)
        .filter(Match.tournament_id == tournament_id)
        .order_by(Match.start_time)
        .all()
    )

    if not matches:
        raise HTTPException(status_code=404, detail="No matches found for this tournament")

    grouped = defaultdict(lambda: defaultdict(list))

    for m in matches:
        field = m.field_id or "Unknown Field"
        date = m.start_time.date().isoformat() if m.start_time else "Unknown Date"  # type: ignore

        grouped[date][field].append({
            "match_id": m.id,
            "team_a_id": m.team_a_id,
            "team_b_id": m.team_b_id,
            "score_a": m.score_a,
            "score_b": m.score_b,
            "status": getattr(m.status, "value", m.status),
            "start_time": m.start_time,
            "end_time": m.end_time,
        })
    schedule = []
    for date, fields in grouped.items():
        sorted_fields = []
        for field_id, matches_list in fields.items():
            sorted_matches = sorted(matches_list, key=lambda x: x["start_time"] or datetime.min)
            sorted_fields.append({
                "field_id": field_id,
                "matches": sorted_matches,
            })
        schedule.append({
            "date": date,
            "fields": sorted(sorted_fields, key=lambda x: x["field_id"]),
        })

    schedule = sorted(schedule, key=lambda x: x["date"])

    return {
        "tournament_id": tournament_id,
        "tournament_title": tournament.title,
        "schedule": schedule,
    }
