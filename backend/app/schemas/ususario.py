from pydantic import BaseModel, EmailStr
from app.models.usuario import RolUsuario


class UsuarioCreate(BaseModel):
    correo: EmailStr
    password: str
    rol: RolUsuario = RolUsuario.estudiante


class UsuarioLogin(BaseModel):
    correo: EmailStr
    password: str


class UsuarioOut(BaseModel):
    id: int
    correo: EmailStr
    rol: RolUsuario

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: RolUsuario