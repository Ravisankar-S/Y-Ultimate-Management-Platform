import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.media import Media
from app.schemas.media import MediaOut
from app.routers.auth import get_current_user, User
from app.core.rate_limits import media_upload_limiter, public_limiter
from loguru import logger
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

@router.post("/tournaments/{tournament_id}/upload", response_model=MediaOut, dependencies=[Depends(media_upload_limiter)])
async def upload_tournament_media(
    tournament_id: int,
    file: UploadFile = File(...),
    caption: str | None = Form(None),
    is_public: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Media upload: {file.filename} for tournament {tournament_id}")
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
    logger.success(f"Media uploaded: {file.filename}")
    return media

@router.get("/tournaments/{tournament_id}/gallery", response_model=list[MediaOut], dependencies=[Depends(public_limiter)])
def tournament_gallery(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(Media).filter(Media.tournament_id == tournament_id, Media.is_public == True).order_by(Media.created_at.desc()).all()

@router.get("/files/{filename}", dependencies=[Depends(public_limiter)])
def media_file(filename: str):
    path = MEDIA_DIR / filename
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(path)


@router.delete("/{media_id}", status_code=204)
async def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Extract filename from URL path
    filename = Path(media.url).name # type: ignore
    file_path = MEDIA_DIR / filename
    
    # Delete from database
    db.delete(media)
    db.commit()
    
    # Delete physical file if it exists
    if file_path.exists():
        try:
            file_path.unlink()
            logger.info(f"Deleted media file: {filename}")
        except Exception as e:
            logger.warning(f"Failed to delete physical file {filename}: {e}")
    
    logger.info(f"Media record {media_id} deleted")
    return None
