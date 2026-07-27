# SIGSRE — pisunpa.com

Sistema de Información para la Gestión de Supletorios, Egresados y Registro Estudiantil de la Universidad del Pacífico — Buenaventura.

---

## Descripción General

SIGSRE gestiona dos dominios principales del ciclo de vida universitario:

- **Supletorios** — Solicitud, pago, revisión y aprobación de exámenes supletorios con workflow de 8 estados.
- **Egresados** — Registro, validación y seguimiento de egresados con información laboral, académica y de contacto.

### Stack Tecnológico

| Capa | Tecnología | Versión |
| :--- | :--- | :--- |
| Backend | Django + Django REST Framework | 5.0 / 3.15 |
| Frontend | Angular (SPA, Standalone Components, Signals) | 19 |
| Base de Datos | PostgreSQL | 16 |
| Autenticación | JWT (SimpleJWT) | 5.3 |
| Tareas Asíncronas | Celery + Redis | 5.6 / 7 |
| API Docs | drf-spectacular (Swagger UI) | 0.27 |
| Infraestructura | Docker Compose | — |

---

## Requisitos Previos

- Docker Engine 24+
- Docker Compose v2
- Git

No se requiere Python, Node.js ni PostgreSQL instalados localmente — todo corre dentro de contenedores Docker.

---

## Instalación (Docker Quickstart)

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd pisunpa-project

# 2. Crear archivo de variables de entorno en la raíz (mismo nivel que docker-compose.yml)
# Ver sección "Variables de Entorno" más abajo para el contenido exacto

# 3. Levantar toda la infraestructura
docker compose up --build -d

# 4. Ejecutar migraciones en PostgreSQL
docker compose exec backend python manage.py migrate

# 5. Crear un superusuario para entrar al admin de Django
docker compose exec backend python manage.py createsuperuser

# 6. Cargar datos base (roles, catálogos) — ver sección "Datos iniciales"
```

> ⚠️ **Importante:** `database/init.sql` y `database/seed.sql` están vacíos actualmente. Los datos base (roles del sistema, programas, departamentos, ciudades) deben crearse manualmente vía `manage.py shell` hasta que se defina un script de seed real — ver sección **Datos iniciales**.

### Servicios levantados

| Servicio | URL | Propósito |
| :--- | :--- | :--- |
| Frontend | `http://localhost:4200` | Angular SPA |
| Backend API | `http://localhost:8000/api/` | Django REST API |
| Swagger UI | `http://localhost:8000/api/docs/` | Documentación interactiva |
| pgAdmin | `http://localhost:5050` | Administración de PostgreSQL |
| Redis | `localhost:6379` | Broker de Celery |

Si el build del frontend tarda mucho (transferencia de contexto de varios minutos), confirmar que existe `frontend/.dockerignore` excluyendo `node_modules`, `dist`, `.angular`.

---

## Arquitectura de Autenticación e Integración

### Flujo JWT

```
┌─────────────┐    POST /api/usuarios/login/    ┌─────────────┐
│   Angular   │ ──────────────────────────────▶ │   Django    │
│   (SPA)     │    { email, password }          │   (API)     │
│             │ ◀────────────────────────────── │             │
│             │    { access, refresh }          │             │
└─────────────┘                                 └─────────────┘
       │
       │  Almacena tokens en localStorage
       │  Adjunta Authorization: Bearer <access> a cada petición
       ▼
┌─────────────┐    GET /api/...                 ┌─────────────┐
│   Angular   │ ──────────────────────────────▶ │   Django    │
│   (SPA)     │    Header: Bearer <token>       │   (API)     │
│             │ ◀────────────────────────────── │             │
│             │    200 OK + datos               │             │
└─────────────┘                                 └─────────────┘
```

### Integración Frontend-Backend

- **URLs dinámicas**: Todos los servicios Angular usan `environment.apiUrl` (`http://127.0.0.1:8000/api`) — nunca se hardcodean rutas.
- **HttpInterceptor**: `auth.interceptor.ts` inyecta automáticamente el header `Authorization: Bearer <token>` en cada petición HTTP.
- **Guard de autenticación**: `auth.guard.ts` protege rutas privadas; redirige a `/login` si no hay token válido.
- **Guard de roles**: `role.guard.ts` verifica el rol del usuario contra los roles permitidos por cada ruta.
- **Sin mocks**: Todos los servicios HTTP apuntan al backend real. No existen datos ficticios en el frontend (el login antiguo con `USUARIOS_MOCK` fue reemplazado por completo).

### Modelo de Usuario

```python
# backend/app/usuarios/models.py
class Usuario(AbstractUser):
    id = UUIDField(primary_key=True)
    email = EmailField(unique=True)          # USERNAME_FIELD
    documento = CharField(max_length=20, unique=True)
    telefono = CharField(max_length=20, blank=True)
    rol = ForeignKey(Rol, null=True)          # administrador | director | secretario | profesor | estudiante | egresado
    foto = ImageField(upload_to="usuarios/", null=True)
```

Todos los IDs del sistema (Usuario, Rol, PerfilEgresado, Supletorio, Programa, Departamento, Ciudad, etc.) son **UUID**, no enteros autoincrementales.

---

## Estructura del Proyecto

```
pisunpa-project/
├── docker-compose.yml
├── .env                        # No se sube al repo (gitignored)
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   ├── core_project/            # Configuración global de Django
│   │   ├── __init__.py          # Importa Celery para autodiscovery
│   │   ├── settings.py          # DRF, JWT, CORS, Celery, apps registradas
│   │   ├── urls.py              # Enrutador maestro + Swagger/schema
│   │   ├── asgi.py
│   │   ├── wsgi.py
│   │   └── celery.py            # Configuración de la app Celery
│   │
│   └── app/                     # Apps de dominio (Domain-Driven Design)
│       ├── __init__.py
│       │
│       ├── usuarios/            # Identidad, autenticación, roles
│       │   ├── admin.py
│       │   ├── apps.py
│       │   ├── models.py        # Usuario (AbstractUser + UUID), Rol
│       │   ├── serializers.py   # Registro, RegistroConRol, Perfil, UsuariosDisponibles
│       │   ├── services.py      # UsuarioService (lógica de registro)
│       │   ├── urls.py
│       │   ├── views.py         # Login (JWT), registro, perfil, disponibles
│       │   └── migrations/
│       │
│       ├── supletorios/         # Workflow de supletorios (8 estados)
│       │   ├── admin.py
│       │   ├── apps.py
│       │   ├── models.py        # Supletorio, AnexoSupletorio, EstadoSupletorio
│       │   ├── serializers.py   # Create, Bandeja (admin), Pendiente (profesor)
│       │   ├── urls.py
│       │   ├── utils.py         # Helper de envío de correo
│       │   ├── views.py         # Crear, aprobar, rechazar, pago, realizado
│       │   └── migrations/
│       │
│       └── egresados/           # Perfiles, catálogos, validación
│           ├── admin.py
│           ├── apps.py
│           ├── models.py        # Departamento, Ciudad, Programa, PerfilEgresado,
│           │                    # ExperienciaLaboral, EstudioPosterior,
│           │                    # RedProfesional, DocumentoAdjunto
│           ├── serializers.py   # Catálogos, PerfilEgresado (read/write)
│           ├── services.py      # EgresadoService (perfil, importación)
│           ├── tasks.py         # Tarea Celery: importación masiva
│           ├── urls.py
│           ├── views.py         # CRUD perfil, validar, mi_perfil, importación
│           └── migrations/
│
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── angular.json
│   ├── package.json
│   ├── src/
│   │   ├── assets/images/       # fondo_pisunpa.png, logo_unpa.png
│   │   ├── environments/
│   │   └── app/
│   │       ├── core/auth/           # AuthService, guards, interceptor, Rol
│   │       ├── features/
│   │       │   ├── login/
│   │       │   ├── registro-manual/     # Registro público de egresados
│   │       │   ├── auth/registro-rol/   # Registro con selector estudiante/egresado
│   │       │   ├── admin/               # Panel administrativo, gestión de usuarios
│   │       │   ├── egresados/           # Listado, formulario, modal de edición
│   │       │   ├── estudiante/          # Solicitud y pago de supletorios
│   │       │   ├── profesor/            # Supletorios pendientes
│   │       │   ├── dashboard/           # KPIs, analítica de egresados
│   │       │   └── portal-egresado/     # Perfil propio del egresado
│   │       ├── models/               # Interfaces TypeScript
│   │       ├── services/             # EgresadosService, SupletorioService, UsuariosService
│   │       └── shared/                # Componentes/servicios reutilizables
│   └── src/index.html
│
└── database/
    ├── init.sql                 # ⚠️ Vacío — pendiente de definir
    └── seed.sql                 # ⚠️ Vacío — pendiente de definir
```

> Se omiten de este árbol: `node_modules/`, `.angular/`, `dist/`, `__pycache__/`, `db.sqlite3`, `media/`, `.env` — no se versionan.
>
> **Nota:** existen carpetas huérfanas `backend/app/models/` y `backend/app/routers/` (vacías, resabio de una arquitectura previa con FastAPI). No afectan el funcionamiento pero deberían eliminarse en una futura limpieza.

---

## Datos Iniciales

Como `database/init.sql` y `database/seed.sql` están vacíos, después de migrar hay que cargar manualmente:

```bash
docker compose exec backend python manage.py shell
```

```python
from app.usuarios.models import Rol
from app.egresados.models import Programa, Departamento, Ciudad

# Roles del sistema
for n in ['administrador', 'director', 'secretario', 'profesor', 'egresado', 'estudiante']:
    Rol.objects.get_or_create(nombre=n)

# Catálogos mínimos de ejemplo
Programa.objects.get_or_create(nombre='Ingeniería de Sistemas')
depto = Departamento.objects.get_or_create(nombre='Valle del Cauca')[0]
Ciudad.objects.get_or_create(nombre='Buenaventura', departamento=depto)
```

Pendiente: definir si `database/init.sql` se reconstruye desde cero para coincidir con el esquema real de Django, o si se reemplaza por un comando de management (`seed_data`) versionado en el repo.

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@pisunpa.com` | `123456` |
| Profesor | `profesor@pisunpa.com` | `123456` |
| Estudiante | `estudiante@pisunpa.com` | `123456` |
| Egresado | `egresado@pisunpa.com` | `123456` |

> Estas cuentas no vienen preexistentes — hay que crearlas manualmente (ver `Datos Iniciales` y crear cada `Usuario` con su `Rol` correspondiente vía shell o el endpoint de registro).

---

## API — Diccionario de Rutas

| Método | Ruta | Auth | Descripción | Estado |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/usuarios/login/` | No | Login → tokens JWT | ✅ Verificado |
| POST | `/api/usuarios/refresh/` | No | Refrescar access token | ⏳ Sin probar |
| POST | `/api/usuarios/registro/` | No | Registro simple de usuario | ⏳ Sin probar |
| POST | `/api/usuarios/registro-con-rol/` | No | Registro con selector egresado/estudiante | ✅ Verificado |
| GET/PUT | `/api/usuarios/perfil/` | JWT | Perfil del usuario autenticado | ✅ Verificado |
| GET | `/api/usuarios/disponibles/` | Admin | Usuarios sin perfil de egresado | ✅ Verificado |
| GET | `/api/egresados/programas/` | No | Catálogo de programas | ✅ Verificado |
| GET | `/api/egresados/departamentos/` | No | Catálogo de departamentos | ✅ Verificado |
| GET | `/api/egresados/ciudades/` | No | Catálogo de ciudades (filtro por departamento) | ✅ Verificado |
| GET/POST/PUT/DELETE | `/api/egresados/perfilegresado/` | JWT | CRUD de perfiles de egresado | ✅ Verificado |
| GET | `/api/egresados/perfilegresado/{id}/` | JWT | Detalle de un perfil | ⏳ Sin probar |
| POST | `/api/egresados/perfilegresado/{id}/validar/` | Admin | Validar egresado + asignar rol | ✅ Verificado |
| GET/PUT | `/api/egresados/perfilegresado/mi_perfil/` | JWT | Perfil propio del egresado | ⏸️ Pausado (Portal Egresado) |
| POST | `/api/egresados/perfilegresado/importacion-masiva/` | Admin | Importación masiva vía Celery | ⏸️ Backend listo, sin conectar en frontend |
| POST | `/api/supletorios/solicitudes/` | JWT | Crear solicitud de supletorio | ✅ Verificado |
| POST | `/api/supletorios/pago/comprobante/` | JWT | Subir comprobante de pago | ✅ Verificado |
| GET | `/api/supletorios/bandeja/` | JWT | Bandeja de solicitudes (admin) | ✅ Verificado |
| POST | `/api/supletorios/bandeja/{id}/aprobar/` | JWT | Aprobar solicitud | ✅ Verificado |
| POST | `/api/supletorios/bandeja/{id}/rechazar/` | JWT | Rechazar solicitud | ✅ Verificado |
| POST | `/api/supletorios/bandeja/{id}/confirmar-pago/` | JWT | Confirmar pago | ✅ Verificado |
| GET | `/api/supletorios/pendientes/` | JWT | Supletorios pendientes (profesor) | ✅ Verificado |
| POST | `/api/supletorios/pendientes/{id}/realizado/` | JWT | Marcar supletorio como realizado | ✅ Verificado |
| GET | `/api/docs/` | No | Swagger UI | ✅ |

**No implementados intencionalmente por ahora:** `GET/DELETE /api/usuarios/` (list/detail) — el frontend los referencia en `usuarios.service.ts` pero no hay vista de backend; el panel de administración de usuarios (`admin.component.ts`) no es prioridad actual.

---

## Flujo de Supletorios (8 estados)

```
pendiente / en_revision → aprobada → formato_pendiente → comprobante_subido
   → notificado_profesor → realizado
   (o rechazada, en cualquier punto antes de "realizado")
```

- Una solicitud entra directamente en **`en_revision`** en vez de `pendiente` si `fecha_solicitud - fecha_parcial > 5 días` (`Supletorio.excede_plazo()`), y el frontend muestra un aviso al estudiante al llenar el formulario si la fecha elegida excede ese límite.
- El campo `profesor` es actualmente texto libre (no hay relación con `Usuario`). Está planeado convertirlo en `ForeignKey` cuando exista un catálogo real de profesores, lo que habilitaría notificar por correo al profesor al confirmar el pago.

---

## Flujo de Validación de Egresados

```
  Registro público (/registro-egresado)
           │
           ▼
  Usuario crea cuenta + perfil de egresado
           │
           ▼
  Perfil queda con validado=False, sin rol asignado
           │
           ▼
  Admin ve perfil en "Gestión de Egresados" (badge 🟡 Pendiente)
           │
           ▼
  Admin hace clic en "Validar"
           │
           ▼
  Backend: validado=True + usuario.rol=egresado
           │
           ▼
  Badge cambia a ✅ Validado
```

---

## Correo Electrónico (desarrollo)

`EMAIL_BACKEND` está configurado como `console` — los correos no se envían realmente, se imprimen en los logs del backend (`docker compose logs backend`). Correos implementados actualmente:

- Al **aprobar** una solicitud → al estudiante.
- Al **marcar como realizado** → al admin, vía `ADMIN_NOTIFICATION_EMAIL` (⚠️ variable pendiente de definir en `.env`).
- Al **confirmar pago** → al profesor: **pendiente**, bloqueado hasta tener relación real `Supletorio.profesor` → `Usuario`.

---

## Verificación de Calidad

```bash
# Backend — pruebas unitarias
docker compose exec backend python manage.py test app

# Backend — linter (PEP8)
docker compose exec backend flake8 app

# Frontend — build de producción
docker compose exec frontend npm run build

# Frontend — pruebas unitarias
docker compose exec frontend npm test
```

> Ejecutar estos comandos antes de cada `git commit`. El backend debe pasar flake8 sin errores nuevos y el frontend debe compilar sin errores.

---

## Variables de Entorno

Crear `.env` en la raíz del proyecto (mismo nivel que `docker-compose.yml`):

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pisunpa

PGADMIN_EMAIL=admin@pisunpa.com
PGADMIN_PASSWORD=admin

JWT_SECRET_KEY=<tu-jwt-secret-key>

# Pendiente de agregar cuando se active el correo real de "supletorio realizado":
# ADMIN_NOTIFICATION_EMAIL=admin@pisunpa.com
```

Variables con default razonable si se omiten (ver `core_project/settings.py`): `DJANGO_SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `USE_SQLITE` (default `False`, usa Postgres), `CORS_ALLOWED_ORIGINS`, `CELERY_BROKER_URL`/`CELERY_RESULT_BACKEND` (ya vienen fijas en `docker-compose.yml` como `redis://redis:6379/0`).

> El archivo `.env` nunca se sube al repositorio (está en `.gitignore`).

---

## Git — Ramas

| Rama | Desarrollador |
| :--- | :--- |
| `Dario` | Backend & Integración |
| `Duvan` | Backend |
| `Esteban` | Backend (esquema de base alternativo, no integrado aún) |
| `Frontend` | Frontend Angular (diseño visual) |
| `Juan` | Backend + integración completa |
| `cristian` | — |

**Nota sobre `Esteban`:** su `database/init.sql` define un esquema completo en SQL puro (tablas en inglés/español distintas, ENUMs de Postgres, relación muchos-a-muchos `usuario_roles`) que **no coincide** con el modelo actual generado por Django (FK simple `Usuario.rol`, UUID por `models.UUIDField`). No se integró — queda como referencia para una eventual migración de esquema si el equipo decide adoptar ese diseño.

---

## Pendientes Conocidos

- [ ] Definir `database/init.sql` / `seed.sql` reales (hoy vacíos; datos se cargan a mano vía shell).
- [ ] Agregar `ADMIN_NOTIFICATION_EMAIL` al `.env`.
- [ ] Relación `Supletorio.profesor` → `Usuario` (FK real) para habilitar correo al profesor y selector en frontend en vez de texto libre.
- [ ] Revisar `PortalEgresadoComponent` (perfil propio del egresado) — componente grande, sin auditar aún.
- [ ] Conectar importación masiva de egresados (Celery) en el frontend — hoy el botón simula con `setTimeout`.
- [ ] Decidir sobre `GET/DELETE /api/usuarios/` — implementar o remover las llamadas del frontend.
- [ ] Eliminar carpetas huérfanas `backend/app/models/` y `backend/app/routers/`.
- [ ] Probar endpoints restantes: `refresh/`, `registro/` (simple), `perfilegresado/{id}/` (detalle).

---

## Comandos Útiles

```bash
# Reiniciar todo el stack
docker compose down && docker compose up -d --build

# Reconstruir solo un servicio
docker compose up -d --build backend

# Ver logs del backend en tiempo real
docker compose logs -f backend

# Shell de Django (crear datos de prueba)
docker compose exec backend python manage.py shell

# Acceder al contenedor del frontend
docker compose exec frontend sh
```