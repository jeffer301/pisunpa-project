# Phase 2 — Registration, Approval & Profesor-Asignatura Assignment

**Date:** 2026-07-24
**Status:** Approved
**Project:** pisunpa-project

---

## 1. Overview

Phase 2 adds three features to the pisunpa system:

1. **Private docente registration** at `/registro/docente` with automatic role assignment
2. **Student registration with approval flow** — students get `pendiente_aprobacion` state, admin approves/rejects
3. **Profesor-Asignatura assignment** — admin links professors to subjects, solicitud form filters professors dynamically

---

## 2. Backend Changes

### 2.1 Usuario Model (`app/usuarios/models.py`)

Add two fields to `Usuario`:

```python
class EstadoUsuario(models.TextChoices):
    PENDIENTE = 'pendiente_aprobacion', 'Pendiente de aprobación'
    APROBADO = 'aprobado', 'Aprobado'
    RECHAZADO = 'rechazado', 'Rechazado'

class Usuario(AbstractUser):
    # ... existing fields ...
    estado = models.CharField(
        max_length=20,
        choices=EstadoUsuario.choices,
        default=EstadoUsuario.APROBADO,  # backward compat
    )
    documento_identidad = models.CharField(max_length=20, blank=True, default='')
```

- `estado` defaults to `aprobado` so existing users are not affected
- `documento_identidad` is optional for existing users (egresados, admins, profesores)

### 2.2 Login Block (`app/usuarios/serializers.py`)

Create `CustomTokenObtainSerializer` extending `TokenObtainPairSerializer`:

- In `validate()`, after calling `super().validate()`, check `self.user.estado`
- If `pendiente_aprobacion` → raise `ValidationError` with message "Tu cuenta está pendiente de aprobación por el director/administrador."
- If `rechazado` → raise `ValidationError` with message "Tu cuenta ha sido rechazada."
- Only `aprobado` users receive a JWT token

Register custom token views at `api/usuarios/login/` (replacing default).

### 2.3 Docente Registration (`app/usuarios/`)

**New serializer:** `RegistroDocenteSerializer(serializers.Serializer)`
- Fields: `email`, `password`, `password2`, `first_name`, `last_name`, `documento_identidad`
- Validates password match, email uniqueness, documento_identidad uniqueness

**New view:** `RegistroDocenteView(APIView)` — `permission_classes = [AllowAny]`
- Validates via `RegistroDocenteSerializer`
- Creates `Usuario` with:
  - `rol = Rol.objects.get(nombre='profesor')`
  - `estado = 'aprobado'` (professors don't need approval)
  - `username = email`
  - `set_password()`
- Returns 201 with success message

**New URL:** `api/usuarios/registro-docente/`

### 2.4 Student Registration — Extend `RegistroConRolView`

Modify `RegistroConRolView` to handle `tipo_usuario='estudiante'`:
- Add `documento_identidad` as required field for students
- Set `estado='pendiente_aprobacion'` when creating student users
- Egresados remain `estado='aprobado'` (validated via PerfilEgresado)

### 2.5 ProfesorAsignatura Model (`app/egresados/models.py`)

```python
class ProfesorAsignatura(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profesor = models.ForeignKey(
        'usuarios.Usuario', on_delete=models.CASCADE,
        related_name='asignaturas_dictadas'
    )
    asignatura = models.ForeignKey(
        'egresados.Asignatura', on_delete=models.CASCADE,
        related_name='profesores_asignados'
    )

    class Meta:
        unique_together = ['profesor', 'asignatura']
        ordering = ['asignatura__nombre']
```

### 2.6 Supletorio Model Changes (`app/supletorios/models.py`)

Change two fields from CharField to ForeignKey:

```python
class Supletorio(models.Model):
    # ... existing fields ...
    profesor = models.ForeignKey(
        'usuarios.Usuario', on_delete=models.PROTECT,
        related_name='supletorios_como_profesor'
    )
    asignatura = models.ForeignKey(
        'egresados.Asignatura', on_delete=models.PROTECT,
        related_name='supletorios'
    )
```

**Migration strategy:** Drop and recreate DB (test data only, no production data).

### 2.7 New Endpoints (`app/egresados/`)

| Method | URL | View | Description |
|--------|-----|------|-------------|
| GET | `api/egresados/profesor-asignaturas/` | `ProfesorAsignaturaListView` | List all assignments (admin) |
| POST | `api/egresados/profesor-asignaturas/` | `ProfesorAsignaturaCreateView` | Create assignment (admin) |
| DELETE | `api/egresados/profesor-asignaturas/{id}/` | `ProfesorAsignaturaDeleteView` | Remove assignment (admin) |
| GET | `api/egresados/profesores-por-asignatura/?asignatura_id=X` | `ProfesoresPorAsignaturaView` | Filter professors by asignatura |

**Serializers:**
- `ProfesorAsignaturaSerializer` — nested read (profesor email/nombre, asignatura nombre)
- `ProfesorAsignaturaWriteSerializer` — write (profesor_id, asignatura_id)

### 2.8 Admin — Pending Students Endpoint

| Method | URL | View | Description |
|--------|-----|------|-------------|
| GET | `api/usuarios/estudiantes-pendientes/` | `EstudiantesPendientesView` | List users with estado=pendiente_aprobacion |
| PATCH | `api/usuarios/usuarios/{id}/aprobar/` | `AprobarEstudianteView` | Set estado=aprobado |
| PATCH | `api/usuarios/usuarios/{id}/rechazar/` | `RechazarEstudianteView` | Set estado=rechazado |

All three require admin role.

---

## 3. Frontend Changes

### 3.1 New Components

| Component | Route | File |
|-----------|-------|------|
| `RegistroDocenteComponent` | `/registro/docente` | `features/registro-docente/` |
| `RegistroEstudianteComponent` | `/registro/estudiante` | `features/registro-estudiante/` |
| `EstudiantesPendientesComponent` | `/admin/estudiantes-pendientes` | `features/admin/estudiantes-pendientes/` |
| `AsignacionProfesoresComponent` | `/admin/asignacion-profesores` | `features/admin/asignacion-profesores/` |

### 3.2 RegistroDocenteComponent

- Standalone, OnPush, signals, reactive forms
- Fields: first_name, last_name, email, documento_identidad, password, password2
- Calls `POST /api/usuarios/registro-docente/`
- On success: shows message "Registro exitoso. Ya puedes iniciar sesión." + redirect to `/login`
- Style: institutional colors, same layout as existing login/registro forms

### 3.3 RegistroEstudianteComponent

- Standalone, OnPush, signals, reactive forms
- Fields: first_name, last_name, email, documento_identidad (C.C./T.I. + number), password, password2
- Calls `POST /api/usuarios/registro-con-rol/` with `tipo_usuario='estudiante'`
- On success: shows message "Tu cuenta está pendiente de aprobación por el director/administrador."
- No redirect to login (user can't log in yet)

### 3.4 EstudiantesPendientesComponent (Admin)

- Standalone, OnPush, signals
- Fetches `GET /api/usuarios/estudiantes-pendientes/`
- Displays table: nombre, email, documento, fecha de registro
- Action buttons: "Aprobar" (PATCH `/api/usuarios/usuarios/{id}/aprobar/`) and "Rechazar" (PATCH `/api/usuarios/usuarios/{id}/rechazar/`)
- Optimistic UI: remove row from list on action

### 3.5 AsignacionProfesoresComponent (Admin)

- Standalone, OnPush, signals
- Fetches `GET /api/egresados/profesor-asignaturas/` (current assignments)
- Fetches `GET /api/egresados/asignaturas/` and available professors (filtered by rol=profesor)
- Two-column layout: left = asignatura dropdown + professor dropdown + "Asignar" button; right = current assignments table
- Delete button on each assignment row
- Calls `POST /api/egresados/profesor-asignaturas/` and `DELETE /api/egresados/profesor-asignaturas/{id}/`

### 3.6 Solicitud Supletorio Form Changes

**Current state:** `profesor` is a free-text `<input>`.

**New state:** `profesor` is a `<select>` dropdown.

Flow:
1. User selects an asignatura from dropdown
2. On change → call `GET /api/egresados/profesores-por-asignatura/?asignatura_id=X`
3. Populate profesor dropdown with results
4. If no professors assigned → show message "No hay profesores asignados a esta materia"
5. Clear profesor selection when asignatura changes

**Frontend service changes:**
- Add `getProfesoresPorAsignatura(asignaturaId: string)` to `EgresadosService`
- Add `getAsignacionProfesores()` and `crearAsignacionProfesor()` and `eliminarAsignacionProfesor()` to `AdminService` or new service
- Add `getEstudiantesPendientes()`, `aprobarEstudiante()`, `rechazarEstudiante()` to admin service

### 3.7 Routes (`app.routes.ts`)

Add:

```typescript
{ path: 'registro/docente', component: RegistroDocenteComponent },
{ path: 'registro/estudiante', component: RegistroEstudianteComponent },
{ path: 'admin/estudiantes-pendientes', component: EstudiantesPendientesComponent,
  canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
{ path: 'admin/asignacion-profesores', component: AsignacionProfesoresComponent,
  canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
```

### 3.8 Admin Panel Navigation

Add links in the admin sidebar/tabs:
- "Estudiantes Pendientes" → `/admin/estudiantes-pendientes`
- "Asignación Profesores" → `/admin/asignacion-profesores`

### 3.9 Login Component Changes

Update `LoginComponent` to handle the new error messages:
- Catch 403 responses from `/api/usuarios/login/`
- Display the backend error message (e.g., "Tu cuenta está pendiente de aprobación...")
- Style as warning banner (yellow/orange)

---

## 4. Database

- Drop and recreate SQLite DB (test data only)
- Run `python manage.py migrate` to apply all new models
- Re-seed: `python manage.py seed_asignaturas`
- Create test profesor via `registro-docente` endpoint
- Create test estudiante via `registro-con-rol` endpoint

---

## 5. Files Changed

### Backend
- `app/usuarios/models.py` — add `estado`, `documento_identidad` fields
- `app/usuarios/serializers.py` — add `CustomTokenObtainSerializer`, `RegistroDocenteSerializer`, `EstudiantePendienteSerializer`
- `app/usuarios/views.py` — add `RegistroDocenteView`, `EstudiantesPendientesView`, `AprobarEstudianteView`, `RechazarEstudianteView`
- `app/usuarios/urls.py` — add `registro-docente/`, `estudiantes-pendientes/`, `usuarios/{id}/aprobar/`, `usuarios/{id}/rechazar/`
- `app/egresados/models.py` — add `ProfesorAsignatura` model
- `app/egresados/serializers.py` — add `ProfesorAsignaturaSerializer`, `ProfesorAsignaturaWriteSerializer`
- `app/egresados/views.py` — add `ProfesorAsignaturaListView`, `ProfesorAsignaturaCreateView`, `ProfesorAsignaturaDeleteView`, `ProfesoresPorAsignaturaView`
- `app/egresados/urls.py` — add profesor-asignaturas and profesores-por-asignatura endpoints
- `app/supletorios/models.py` — change `profesor` and `asignatura` to FKs
- `app/supletorios/serializers.py` — update for FK fields

### Frontend
- `app/models/asignatura.model.ts` — already exists, no change
- `app/models/usuario.model.ts` — add `estado`, `documento_identidad`
- `app/services/egresados.service.ts` — add `getProfesoresPorAsignatura()`, `getAsignacionProfesores()`, etc.
- `app/services/admin.service.ts` (new or extend) — add student approval methods
- `app/features/registro-docente/` — new component
- `app/features/registro-estudiante/` — new component
- `app/features/admin/estudiantes-pendientes/` — new component
- `app/features/admin/asignacion-profesores/` — new component
- `app/features/estudiante/solicitud-supletorio/` — change profesor to select dropdown
- `app/features/login/login.component.ts` — handle 403 error messages
- `app/app.routes.ts` — add new routes
- `app/features/admin/admin.component.ts` — add sidebar links

---

## 6. Acceptance Criteria

1. `/registro/docente` renders a registration form; submitting creates a user with `rol=profesor`
2. `/registro/estudiante` renders a registration form with documento_identidad; submitting creates a user with `estado=pendiente_aprobacion`
3. Login with `pendiente_aprobacion` returns 403 with descriptive message
4. Login with `rechazado` returns 403 with descriptive message
5. Admin panel shows "Estudiantes Pendientes" with approve/reject buttons
6. Admin panel shows "Asignación Profesores" to link professors to subjects
7. Solicitud form: selecting an asignatura filters the profesor dropdown
8. `Supletorio.profesor` and `Supletorio.asignatura` are FKs
9. All existing tests still pass (or are updated for FK changes)
10. `npx ng build` passes without errors
