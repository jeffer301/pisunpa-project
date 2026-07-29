from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid
import os

app = FastAPI(title="Pisunpa API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

supletorios_db: list[dict] = []
next_id = 1


@app.get("/")
def root():
    return {"message": "Pisunpa API running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/supletorios")
def get_supletorios():
    return supletorios_db


@app.post("/api/supletorios")
async def crear_supletorio(
    fecha_examen: str = Form(...),
    docente: str = Form(...),
    asignatura: str = Form(...),
    grupo: str = Form(...),
    programa: str = Form(...),
    motivo: str = Form(...),
    archivo_excusa: Optional[UploadFile] = File(None),
):
    global next_id

    excusa_url = ""
    if archivo_excusa:
        ext = os.path.splitext(archivo_excusa.filename)[1]
        filename = f"excusa_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        content = await archivo_excusa.read()
        with open(filepath, "wb") as f:
            f.write(content)
        excusa_url = f"/uploads/{filename}"

    solicitud = {
        "id": next_id,
        "asignatura": asignatura,
        "docente": docente,
        "fechaExamen": fecha_examen,
        "motivo": motivo,
        "archivoExcusaUrl": excusa_url,
        "estado": "PENDIENTE",
        "fechaProgramada": None,
        "reciboPagoUrl": None,
        "observaciones": "",
        "grupo": grupo,
        "programa": programa,
    }
    next_id += 1
    supletorios_db.append(solicitud)
    return solicitud


@app.patch("/api/supletorios/{supletorio_id}")
async def subir_comprobante(
    supletorio_id: int,
    recibo_pago: UploadFile = File(...),
):
    for s in supletorios_db:
        if s["id"] == supletorio_id:
            ext = os.path.splitext(recibo_pago.filename)[1]
            filename = f"recibo_{uuid.uuid4().hex}{ext}"
            filepath = os.path.join(UPLOAD_DIR, filename)
            content = await recibo_pago.read()
            with open(filepath, "wb") as f:
                f.write(content)
            s["reciboPagoUrl"] = f"/uploads/{filename}"
            s["estado"] = "PAGADO"
            return s

    raise HTTPException(status_code=404, detail="Supletorio no encontrado")
