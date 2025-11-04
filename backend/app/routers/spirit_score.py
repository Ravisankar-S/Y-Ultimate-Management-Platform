from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routers.auth import get_db
from app.models.spirit_score import SpiritScore
from app.models.match import Match
from app.schemas.spirit_score import SpiritScoreCreate, SpiritScoreOut
from app.core.redis import publish
from datetime import datetime

router = APIRouter(prefix="/spirit", tags=["Spirit Scores"])

@router.post("/", response_model=SpiritScoreOut)
async def submit_spirit_score(payload: SpiritScoreCreate, db: Session = Depends(get_db)):
    """
    Submit spirit score for a completed match.
    Publishes to Redis: live:match:{match_id}
    """
    match = db.query(Match).filter(Match.id == payload.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # compute total automatically
    total = (
        payload.rules_knowledge +
        payload.fouls_body_contact +
        payload.fair_mindedness +
        payload.positive_attitude +
        payload.communication
    )

    spirit = SpiritScore(
        match_id=payload.match_id,
        from_team_id=payload.from_team_id,
        to_team_id=payload.to_team_id,
        rules_knowledge=payload.rules_knowledge,
        fouls_body_contact=payload.fouls_body_contact,
        fair_mindedness=payload.fair_mindedness,
        positive_attitude=payload.positive_attitude,
        communication=payload.communication,
        total=total,
        comments=payload.comments,
        submitted_by=payload.submitted_by,
        created_at=datetime.utcnow(),
    )

    db.add(spirit)
    db.commit()
    db.refresh(spirit)

    # publish update to Redis
    await publish(f"live:match:{payload.match_id}", {
        "type": "spirit_update",
        "match_id": payload.match_id,
        "from_team": payload.from_team_id,
        "to_team": payload.to_team_id,
        "total": total,
        "details": {
            "rules_knowledge": payload.rules_knowledge,
            "fouls_body_contact": payload.fouls_body_contact,
            "fair_mindedness": payload.fair_mindedness,
            "positive_attitude": payload.positive_attitude,
            "communication": payload.communication,
        },
        "comments": payload.comments,
    })

    return spirit
