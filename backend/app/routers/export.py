import io
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from app.db.session import SessionLocal
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.spirit_score import SpiritScore
from app.core.deps import require_roles
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tournaments", tags=["Export"])

# ✅ Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{tournament_id}/export", response_class=StreamingResponse)
def export_tournament_data(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch tournament and its matches
    tournament = (
        db.query(Tournament)
        .options(joinedload(Tournament.matches))
        .filter(Tournament.id == tournament_id)
        .first()
    )
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    matches = (
        db.query(Match)
        .filter(Match.tournament_id == tournament_id)
        .options(
            joinedload(Match.team_a),
            joinedload(Match.team_b),
            joinedload(Match.spirit_scores)
        )
        .all()
    )

    # Prepare CSV
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow([
        "Tournament",
        "Team A",
        "Team B",
        "Score A",
        "Score B",
        "Spirit A→B",
        "Spirit B→A",
        "Status",
        "Field",
        "Start Time"
    ])

    for match in matches:
        spirit_a_to_b = next(
            (s.total for s in match.spirit_scores if s.from_team_id == match.team_a_id),
            None
        )
        spirit_b_to_a = next(
            (s.total for s in match.spirit_scores if s.from_team_id == match.team_b_id),
            None
        )

        writer.writerow([
            tournament.title,
            match.team_a.name if match.team_a else "-",
            match.team_b.name if match.team_b else "-",
            match.score_a,
            match.score_b,
            spirit_a_to_b or "-",
            spirit_b_to_a or "-",
            match.status,
            match.field_id or "-",
           (match.start_time.strftime("%Y-%m-%d %H:%M") if getattr(match, "start_time", None) else "-")

        ])

    buffer.seek(0)
    filename = f"tournament_{tournament_id}_export.csv"

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export-all", response_class=StreamingResponse, dependencies=[Depends(require_roles("admin"))])
def export_all_tournaments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tournaments = db.query(Tournament).options(joinedload(Tournament.matches)).all()
    if not tournaments:
        raise HTTPException(status_code=404, detail="No tournaments found")

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow([
        "Tournament",
        "Team A",
        "Team B",
        "Score A",
        "Score B",
        "Spirit A→B",
        "Spirit B→A",
        "Status",
        "Field",
        "Start Time"
    ])

    for tournament in tournaments:
        for match in tournament.matches:
            spirit_a_to_b = next(
                (s.total for s in match.spirit_scores if s.from_team_id == match.team_a_id),
                None
            )
            spirit_b_to_a = next(
                (s.total for s in match.spirit_scores if s.from_team_id == match.team_b_id),
                None
            )

            writer.writerow([
                tournament.title,
                match.team_a.name if match.team_a else "-",
                match.team_b.name if match.team_b else "-",
                match.score_a,
                match.score_b,
                spirit_a_to_b or "-",
                spirit_b_to_a or "-",
                match.status,
                match.field_id or "-",
                match.start_time.strftime("%Y-%m-%d %H:%M") if match.start_time else "-"
            ])

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=all_tournaments_export.csv"}
    )