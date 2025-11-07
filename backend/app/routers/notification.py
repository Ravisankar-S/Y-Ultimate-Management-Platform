from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationOut
from app.routers.auth import get_current_user
from app.models.user import User
from app.core.redis import publish
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.post("/", response_model=NotificationOut)
async def create_notification(notif: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_notif = Notification(**notif.model_dump())
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    await publish(f"notify:user:{notif.user_id}", {
        "type": notif.type,
        "payload": notif.payload_json,
        "created_at": str(new_notif.created_at)
    })
    return new_notif

@router.patch("/{notif_id}/read", response_model=NotificationOut)
def mark_as_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True # type: ignore
    db.commit()
    db.refresh(notif)
    return notif