from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from .auth import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentOut
from app.core.deps import require_roles
from .auth import get_current_user

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

@router.get("/", response_model=list[TournamentOut])
def list_tournaments(db: Session = Depends(get_db)):
    tournaments = db.query(Tournament).filter(Tournament.is_published == True).all()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentOut)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found")
    return tournament

@router.post("/", response_model=TournamentOut, status_code=status.HTTP_201_CREATED)
def create_tournament(
    tournament_data: TournamentCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "manager")),
):
    new_tournament = Tournament(**tournament_data.dict(), created_by=current_user.id)
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    return new_tournament