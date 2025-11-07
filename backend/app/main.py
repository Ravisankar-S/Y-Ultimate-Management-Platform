from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routers import auth, health, tournament_routes, team, participant, team_member, match, ws, spirit_score, leaderboard, analytics, coaching, export, notification, media
from app.db.session import engine, Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Y-Ultimate Management Platform Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "Backend Fired Up 🚀"}