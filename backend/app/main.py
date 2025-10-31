from fastapi import FastAPI
from app.routers import auth
from app.db.session import engine, Base

app = FastAPI(title="Y-Ultimate Management Platform Backend")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Backend Fired Up 🚀"}