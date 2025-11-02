from fastapi import FastAPI
from app.routers import auth
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

@app.get("/")
def root():
    return {"message": "Backend Fired Up 🚀"}