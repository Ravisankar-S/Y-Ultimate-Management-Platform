from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from .auth import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentOut
from app.core.deps import require_roles
from .auth import get_current_user
from app.core.rate_limits import public_limiter, frequent_action_limiter
from app.core.cache_utils import invalidate_global_analytics, invalidate_tournament_analytics
from loguru import logger

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

@router.get("/", response_model=list[TournamentOut], dependencies=[Depends(public_limiter)])
def list_tournaments(db: Session = Depends(get_db)):
    tournaments = db.query(Tournament).filter(Tournament.is_published == True).all()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentOut, dependencies=[Depends(public_limiter)])
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return tournament

@router.post("/", response_model=TournamentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(frequent_action_limiter)])
async def create_tournament(
    tournament_data: TournamentCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "manager")),
):
    logger.info(f"Creating tournament: {tournament_data.title}")
    new_tournament = Tournament(**tournament_data.dict(), created_by=current_user.id)
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    logger.success(f"Tournament created: {new_tournament.title} (ID: {new_tournament.id})")
    await invalidate_global_analytics()
    return new_tournament


@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(frequent_action_limiter)])
async def delete_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin"))
):
    logger.info(f"Admin {current_user.username} deleting tournament {tournament_id}")
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    
    db.delete(tournament)
    db.commit()
    logger.success(f"Tournament {tournament_id} deleted with cascade")
    await invalidate_global_analytics()
    await invalidate_tournament_analytics(tournament_id)
    return None