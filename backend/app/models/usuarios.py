import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from app.database import Base


class RolUsuario(str, enum.Enum):
    admin = "admin"
    egresado = "egresado"
    estudiante = "estudiante"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    correo = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(
        Enum(RolUsuario, name="rol_usuario"),
        nullable=False,
        default=RolUsuario.estudiante,
    )
    activo = Column(Integer, default=1)  # 1 = activo, 0 = deshabilitado
    creado_en = Column(DateTime(timezone=True), server_default=func.now())