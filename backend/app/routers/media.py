import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.media import Media
from app.schemas.media import MediaOut
from app.routers.auth import get_current_user, User  # your User model
from pathlib import Path

router = APIRouter(prefix="/media", tags=["Media"])

MEDIA_DIR = Path(os.getenv("MEDIA_DIR", "./media"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/tournaments/{tournament_id}/upload", response_model=MediaOut)
async def upload_tournament_media(
    tournament_id: int,
    file: UploadFile = File(...),
    caption: str | None = Form(None),
    is_public: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = Path(file.filename).suffix # type: ignore
    new_name = f"{uuid.uuid4().hex}{ext}"
    dest = MEDIA_DIR / new_name

    with dest.open("wb") as f:
        content = await file.read()
        f.write(content)

    url_path = f"/media/files/{new_name}"

    media = Media(
        tournament_id=tournament_id,
        uploader_id=current_user.id,
        filename=file.filename,
        url=url_path,
        mime=file.content_type,
        caption=caption,
        is_public=is_public
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@router.get("/tournaments/{tournament_id}/gallery", response_model=list[MediaOut])
def tournament_gallery(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(Media).filter(Media.tournament_id == tournament_id, Media.is_public == True).order_by(Media.created_at.desc()).all()

# optional: single-file downloads
@router.get("/files/{filename}")
def media_file(filename: str):
    path = MEDIA_DIR / filename
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(path)
