from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from typing import List
from app.routers.auth import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate, ParticipantOut

router = APIRouter(prefix="/participants", tags=["participants"])

@router.post("/", response_model=ParticipantOut)
def create_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
    new_participant = Participant(**participant.dict())
    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)
    return new_participant

@router.get("/", response_model=List[ParticipantOut])
def list_participants(db: Session = Depends(get_db)):
    participants = db.query(Participant).all()
    return participants

@router.get("/{participant_id}", response_model=ParticipantOut)
def get_participant(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


@router.delete("/{participant_id}", status_code=204)
def delete_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    db.delete(participant)
    db.commit()
    return None

