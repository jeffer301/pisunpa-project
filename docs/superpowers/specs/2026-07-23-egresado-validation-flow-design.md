# Diseño: Flujo de Validación de Egresados

**Fecha**: 2026-07-23
**Estado**: Pendiente de aprobación

## Contexto

El admin puede registrar egresados desde el panel, pero actualmente se crean usuarios automáticos sin nombre ni teléfono, y no hay forma de distinguir egresados pendientes de validación. Se necesita:

1. Selector de usuario existente al crear un perfil desde el admin
2. Registro público donde el usuario elige si es egresado o estudiante
3. Flujo de validación: admin revisa y aprueba egresados antes de asignarles el rol

## Modelo de datos

### Cambio en `PerfilEgresado`

```python
# backend/app/egresados/models.py
validado = models.BooleanField(default=False)
```

- `False` = perfil pendiente de validación (por defecto al crear)
- `True` = admin validó que la persona es egresado real
- Se agrega a ambos serializers (read lo muestra, write lo acepta en PATCH)

### Migración

Nueva migración `0005_perfilegresado_validado.py`.

## Flujo 1: Admin registra egresado existente

### Backend

**Nuevo endpoint: `GET /api/usuarios/disponibles/`**
- Solo admins
- Retorna usuarios que NO tengan `PerfilEgresado` vinculado
- Campos: `id, email, first_name, last_name, documento, telefono`

**Endpoint de validación: `POST /api/egresados/perfilegresado/{id}/validar/`**
- Solo admins
- Asigna `validado=True` al perfil
- Asigna `rol=egresado` al usuario
- Registra en bitácora de auditoría (Skill 4)

**Cambio en `perform_create`:**
- Si admin selecciona un usuario existente: vincula el perfil a ese usuario (sin cambiar su rol)
- Si admin crea sin seleccionar usuario: crea usuario nuevo (flujo actual mejorado)

### Frontend

**Formulario admin (`formulario-egresado`):**
- Nuevo campo: selector de usuario (dropdown, solo visible para admins)
- Al seleccionar usuario: auto-llena `numero_documento` desde `usuario.documento` y `telefono_celular` desde `usuario.telefono`
- Campos restantes: programa, dirección, biografía, etc.
- Al guardar: crea `PerfilEgresado` con `validado=False`

**Tabla admin (`gestion-egresados`):**
- Nueva columna "Estado" con badge:
  - 🟡 Pendiente (validado=false)
  - ✅ Validado (validado=true)
- Botón "Validar" visible solo para perfiles pendientes
- Filtro adicional: "Todos" / "Pendientes" / "Validados"

## Flujo 2: Registro público con selector de tipo

### Backend

**Nuevo endpoint: `POST /api/usuarios/registro/`**
- `AllowAny` (sin autenticación)
- Acepta: `email, password, first_name, last_name, documento, telefono, tipo_usuario` (`'egresado'` | `'estudiante'`)
- Si `tipo_usuario == 'egresado'`:
  - Crea `Usuario` con `rol=null`
  - Crea `PerfilEgresado` con `validado=False` (requiere campos adicionales del perfil)
  - Retorna 201 con "Registro como egresado pendiente de validación"
- Si `tipo_usuario == 'estudiante'`:
  - Crea `Usuario` con `rol=estudiante`
  - Retorna 201 con "Registro exitoso"
- Transacción atómica

### Frontend

**Componente existente de registro (o nuevo):**
- Ruta: `/registro` (pública)
- Formulario con selector de tipo: "¿Eres egresado o estudiante?"
- Si selecciona "Egresado": se expanden campos adicionales (programa, dirección, etc.)
- Si selecciona "Estudiante": solo datos de usuario
- Al enviar: llama al endpoint de registro
- Si es egresado: redirige a "Tu registro está pendiente de validación por el admin"
- Si es estudiante: redirige a login

## Flujo 3: Validación por admin

1. Admin ve tabla de egresados con columna "Estado"
2. Perfiles pendientes muestran badge 🟡 + botón "Validar"
3. Admin hace clic en "Validar" → se llama `POST /api/egresados/perfilegresado/{id}/validar/`
4. Backend:
   - `perfil.validado = True`
   - `usuario.rol = Rol.objects.get(nombre='egresado')`
   - Registra auditoría
5. Frontend actualiza el badge a ✅ "Validado"

## Endpoints resumen

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/usuarios/disponibles/` | Admin | Usuarios sin perfil egresado |
| POST | `/api/usuarios/registro/` | Public | Registro con selector egresado/estudiante |
| POST | `/api/egresados/perfilegresado/` | Admin | Crear perfil (vincula a usuario existente) |
| POST | `/api/egresados/perfilegresado/{id}/validar/` | Admin | Validar egresado |

## Archivos a modificar

### Backend
- `backend/app/egresados/models.py` — agregar campo `validado`
- `backend/app/egresados/serializers.py` — agregar `validado` a read/write serializers
- `backend/app/egresados/views.py` — endpoint validar, mejorar perform_create
- `backend/app/usuarios/views.py` — endpoint disponibles (nuevo), endpoint registro (nuevo)
- `backend/app/usuarios/serializers.py` — serializer para disponibles y registro (nuevo)
- `backend/app/usuarios/urls.py` — rutas disponibles y registro (nuevas)

### Frontend
- `frontend/src/app/features/egresados/formulario-egresado.component.*` — selector de usuario, auto-fill
- `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.*` — columna estado, filtro, btn validar
- `frontend/src/app/services/egresados.service.ts` — métodos validar, disponibles
- `frontend/src/app/services/usuarios.service.ts` — método registro
- Componente de registro público (nuevo o existente modificado)
- `frontend/src/app/app.routes.ts` — ruta `/registro`
