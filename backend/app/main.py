from fastapi import FastAPI
from app.routers import auth, health, tournament_routes, team, participant
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

app.include_router(auth.router)
app.include_router(health.router)
app.include_router(tournament_routes.router)
app.include_router(team.router)
app.include_router(participant.router)

@app.get("/")
def root():
    return {"message": "Backend Fired Up 🚀"}