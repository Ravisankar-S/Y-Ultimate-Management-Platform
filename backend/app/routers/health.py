from fastapi import APIRouter
from sqlalchemy import text
from app.db.session import SessionLocal
import time
import os

router = APIRouter(prefix="/health", tags=["health"])

start_time = time.time()

@router.get("/")

def health_check():
    """Health check endpoint."""
    db = SessionLocal()
    try:
        # Simple query to check database connectivity
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False
    finally:
        db.close()

    # Redis check (optional)
    redis_ok = None
    try:
        from app.core.redis import redis_client
        if redis_client:
            redis_client.ping()
            redis_ok = True
        else:
            redis_ok = False
    except Exception as e:
        redis_ok = False

    uptime = round(time.time() - start_time, 2)

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": db_ok,
        "redis": redis_ok,
        "uptime_seconds": uptime,
        "environment": os.getenv("ENV", "development"),
    }