import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está definida. Revisa la variable 'environment' "
        "en docker-compose.yml para el servicio backend."
    )

# El engine mantiene el pool de conexiones hacia PostgreSQL
engine = create_engine(DATABASE_URL)

# Cada instancia de SessionLocal es una sesión/transacción individual
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Todos los modelos (Egresado, Supletorio, Metrica, Desarrollador) heredarán de Base
Base = declarative_base()


def get_db():
    """
    Dependencia de FastAPI: abre una sesión por request y la cierra al terminar,
    incluso si ocurre un error dentro del endpoint.

    Uso en un router:
        from app.database import get_db
        from sqlalchemy.orm import Session
        from fastapi import Depends

        @router.get("/")
        def listar(db: Session = Depends(get_db)):
            return db.query(Egresado).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()