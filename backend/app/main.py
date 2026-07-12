from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.routers import auth


app = FastAPI(title="Pisunpa API")

app.include_router(auth.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "pisunpa-backend"}


@app.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}