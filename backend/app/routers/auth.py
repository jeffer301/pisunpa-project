from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario, RolUsuario
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioOut, Token
from app.core.security import hash_password, verify_password, crear_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar(usuario_in: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.correo == usuario_in.correo).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con ese correo",
        )

    nuevo_usuario = Usuario(
        correo=usuario_in.correo,
        password_hash=hash_password(usuario_in.password),
        rol=usuario_in.rol,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post("/login", response_model=Token)
def login(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == credenciales.correo).first()

    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta cuenta está deshabilitada",
        )

    token = crear_access_token(data={"sub": usuario.correo, "rol": usuario.rol.value})
    return Token(access_token=token, rol=usuario.rol)


@router.get("/me", response_model=UsuarioOut)
def yo(usuario: Usuario = Depends(get_current_user)):
    return usuario