from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.routers.auth import get_db
from app.models.team import Team
from app.models.match import Match
from app.models.spirit_score import SpiritScore
from app.schemas.leaderboard import LeaderboardTeamOut
from app.core.redis import publish

router = APIRouter(prefix="/tournaments", tags=["Leaderboard"])

@router.get("/{tournament_id}/leaderboard", response_model=list[LeaderboardTeamOut])
async def get_tournament_leaderboard(tournament_id: int, db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.tournament_id == tournament_id).all()
    if not teams:
        raise HTTPException(status_code=404, detail="No teams found for this tournament")

    leaderboard = []

    for team in teams:
        matches = db.query(Match).filter(
            Match.tournament_id == tournament_id,
            (Match.team_a_id == team.id) | (Match.team_b_id == team.id)
        ).all()

        wins = losses = draws = goals_for = goals_against = 0
        completed_matches = [m for m in matches if m.status == "completed"] # type: ignore
        matches_played = len(completed_matches)

        for match in completed_matches:
            if match.team_a_id == team.id: # type: ignore
                gf, ga = match.score_a, match.score_b
            else:
                gf, ga = match.score_b, match.score_a

            goals_for += gf
            goals_against += ga

            if gf > ga: # type: ignore
                wins += 1
            elif gf < ga: # type: ignore
                losses += 1
            else:
                draws += 1

        points = wins * 3 + draws

        spirit_scores = db.query(func.avg(SpiritScore.total)).filter(
            SpiritScore.to_team_id == team.id
        ).scalar() or 0.0

        leaderboard.append({
            "team_id": team.id,
            "team_name": team.name,
            "matches_played": matches_played,
            "wins": wins,
            "losses": losses,
            "draws": draws,
            "points": points,
            "goals_for": goals_for,
            "goals_against": goals_against,
            "goal_diff": goals_for - goals_against,
            "spirit_avg": round(float(spirit_scores), 2),
        })

    # Sort teams by points, goal difference, then spirit average
    leaderboard.sort(key=lambda x: (x["points"], x["goal_diff"], x["spirit_avg"]), reverse=True)

    # Assign ranks after sorting
    for i, team in enumerate(leaderboard, start=1):
        team["rank"] = i

    await publish(f"live:leaderboard:{tournament_id}", {"leaderboard": leaderboard})

    return leaderboard