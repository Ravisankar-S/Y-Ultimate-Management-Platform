from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import (
    auth, health, tournament_routes, team, participant, 
    team_member, match, ws, spirit_score, leaderboard, 
    analytics, coaching, export, notification, media
)
from app.db.session import engine, Base
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter
from loguru import logger
import sys
import time

# Logging configuration
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO",
    colorize=True,
)

LOG_DIR = Path("./logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
logger.add(
    LOG_DIR / "app.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}",
    level="INFO",
    rotation="1 MB",
    retention="10 days",
    compression="zip",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Redis for rate limiting on startup, close on shutdown."""
    logger.info("Starting Y-Ultimate Management Platform Backend")
    
    try:
        redis_connection = redis.from_url(
            settings.REDIS_URL, 
            encoding="utf-8", 
            decode_responses=True
        )
        await FastAPILimiter.init(redis_connection)
        logger.success(f"Redis connected at {settings.REDIS_URL}")
        logger.success("Rate limiter initialized")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        logger.warning("Rate limiting will be disabled")
    
    logger.info("Application startup complete")
    yield
    
    logger.info("Shutting down application")
    try:
        await FastAPILimiter.close()
        logger.info("Rate limiter closed")
    except Exception as e:
        logger.error(f"Error closing rate limiter: {e}")
    logger.info("Application shutdown complete")

app = FastAPI(
    title="Y-Ultimate Management Platform Backend",
    description="Tournament and Coaching Management System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing."""
    start_time = time.time()
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
    return response

Base.metadata.create_all(bind=engine)

MEDIA_DIR = Path("./media")
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media/files", StaticFiles(directory=str(MEDIA_DIR)), name="media")

app.include_router(auth.router)
app.include_router(health.router)
app.include_router(tournament_routes.router)
app.include_router(team.router)
app.include_router(participant.router)
app.include_router(team_member.router)
app.include_router(match.router)
app.include_router(ws.router)
app.include_router(spirit_score.router)
app.include_router(leaderboard.router)
app.include_router(analytics.router)
app.include_router(coaching.router)
app.include_router(export.router)
app.include_router(notification.router)
app.include_router(media.router)

@app.get("/")
def root():
    return {"message": "Backend Fired Up"}