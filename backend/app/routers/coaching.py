from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date

from app.db.session import SessionLocal
from app.models.session import Session as CoachingSession
from app.models.attendance import Attendance
from app.models.home_visit import HomeVisit
from app.models.lsas_assessment import LSASAssessment
from app.models.participant import Participant
from app.models.user import User
from app.schemas.session import SessionCreate, SessionOut
from app.schemas.attendance import AttendanceCreate, AttendanceOut
from app.schemas.home_visit import HomeVisitCreate, HomeVisitOut
from app.schemas.lsas_assessment import LSASAssessmentCreate, LSASAssessmentOut
from app.routers.auth import get_current_user
from app.core.deps import require_roles

router = APIRouter(prefix="/coaching", tags=["Coaching & Attendance"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/sessions/", response_model=SessionOut)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("coach", "manager", "admin")),
):
    new_session = CoachingSession(**session_data.model_dump())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/sessions/{session_id}/attendance", response_model=List[AttendanceOut])
def mark_attendance(
    session_id: int,
    records: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("coach", "manager", "admin")),
):
    session = db.query(CoachingSession).filter(CoachingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    attendances = []
    for record in records:
        att = Attendance(
            participant_id=record.participant_id,
            session_id=session_id,
            tournament_id=record.tournament_id,
            date=record.date or date.today(),
            present=record.present,
            marked_by=current_user.id,
            notes=record.notes,
        )
        db.add(att)
        attendances.append(att)

    db.commit()
    for att in attendances:
        db.refresh(att)
    return attendances

@router.post("/participants/{participant_id}/home-visit", response_model=HomeVisitOut)
def record_home_visit(
    participant_id: int,
    data: HomeVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("coach", "manager", "admin")),
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    visit = HomeVisit(
        participant_id=participant_id,
        coach_id=data.coach_id or None,
        visit_date=data.visit_date,
        notes=data.notes,
        photos_json=data.photos_json,
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


@router.post("/participants/{participant_id}/lsas", response_model=LSASAssessmentOut)
def record_lsas_assessment(
    participant_id: int,
    data: LSASAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("coach", "manager", "admin")),
):
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    assessment = LSASAssessment(
        participant_id=participant_id,
        assessor_id=current_user.id,
        date=data.date,
        scores_json=data.scores_json,
        total_score=sum(data.scores_json.values()) if data.scores_json else 0.0,
        notes=data.notes,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/analytics/coaching-overview")
def coaching_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("manager", "admin")),
):
    """
    Returns a high-level snapshot for coaches & managers:
    - Total sessions held
    - Total attendances recorded
    - Attendance rate
    - Average LSAS score
    - Total home visits
    """
    total_sessions = db.query(CoachingSession).count()
    total_attendances = db.query(Attendance).count()
    total_participants = db.query(Participant).count() or 1  # avoid division by zero
    total_home_visits = db.query(HomeVisit).count()

    total_present = db.query(Attendance).filter(Attendance.present.is_(True)).count()
    attendance_rate = round((total_present / total_attendances) * 100, 2) if total_attendances else 0.0

    avg_lsas = db.query(func.avg(LSASAssessment.total_score)).scalar() or 0.0

    return {
        "total_sessions": total_sessions,
        "total_attendances": total_attendances,
        "attendance_rate_percent": attendance_rate,
        "avg_lsas_score": round(float(avg_lsas), 2),
        "total_home_visits": total_home_visits,
        "total_participants": total_participants,
    }