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

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de Entorno)

# 3. Levantar toda la infraestructura
docker compose up -d --build

# 4. Ejecutar migraciones en PostgreSQL
docker compose exec backend python manage.py migrate

# 5. Crear datos iniciales (roles, programas, etc.)
docker compose exec backend python manage.py shell < database/seed.py

# 6. Crear usuarios de prueba
docker compose exec backend python manage.py createsuperuser
```

### Servicios levantados

| Servicio | URL | Propósito |
| :--- | :--- | :--- |
| Frontend | `http://localhost:4200` | Angular SPA |
| Backend API | `http://localhost:8000/api/` | Django REST API |
| Swagger UI | `http://localhost:8000/api/docs/` | Documentación interactiva |
| pgAdmin | `http://localhost:5050` | Administración de PostgreSQL |
| Redis | `localhost:6379` | Broker de Celery |

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
- **Sin mocks**: Todos los servicios HTTP apuntan al backend real. No existen datos ficticios.

### Modelo de Usuario

```python
# backend/app/usuarios/models.py
class Usuario(AbstractUser):
    id = UUIDField(primary_key=True)
    email = EmailField(unique=True)          # USERNAME_FIELD
    documento = CharField(max_length=20, unique=True)
    telefono = CharField(max_length=20, blank=True)
    rol = ForeignKey(Rol, null=True)          # administrador | profesor | estudiante | egresado
    foto = ImageField(upload_to="usuarios/", null=True)
```

---

## Estructura del Proyecto

```
pisunpa-project/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── core_project/          # Configuración Django (settings, urls, wsgi)
│   └── app/
│       ├── usuarios/          # Autenticación, registro, gestión de usuarios
│       ├── supletorios/       # Workflow de supletorios (8 estados)
│       └── egresados/         # Perfiles de egresados, validación, catálogos
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/          # Auth service, interceptors, guards
│   │       ├── features/      # Componentes por módulo
│   │       │   ├── admin/         # Panel administrativo
│   │       │   ├── egresados/     # Formulario y gestión de egresados
│   │       │   ├── estudiante/    # Solicitud y pago de supletorios
│   │       │   ├── profesor/      # Revisión de supletorios
│   │       │   ├── login/         # Inicio de sesión
│   │       │   └── registro-manual/ # Registro público con selector de rol
│   │       ├── models/        # Interfaces TypeScript
│   │       └── services/      # Servicios HTTP (EgresadosService, UsuariosService, etc.)
│   └── package.json
│
└── database/
    └── init.sql               # Inicialización de PostgreSQL
```

---

## Credenciales de Prueba

Cuentas creadas en PostgreSQL para validación de roles:

| Rol | Email | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| Administrador | `admin@pisunpa.com` | `<rol>123` | Gestión global del sistema |
| Profesor | `profesor@pisunpa.com` | `<rol>123` | Revisión de supletorios |
| Estudiante | `estudiante@pisunpa.com` | `<rol>123` | Solicitud y pago de supletorios |
| Egresado | `egresado@pisunpa.com` | `<rol>123` | Actualización de perfil |

> Las contraseñas siguen el patrón `<rol>123` (ej: `administrador123`, `profesor123`).

---

## API — Diccionario de Rutas

| Método | Ruta | Auth | Descripción |
| :--- | :--- | :--- | :--- |
| POST | `/api/usuarios/login/` | No | Login → tokens JWT |
| POST | `/api/usuarios/refresh/` | No | Refrescar access token |
| POST | `/api/usuarios/registro/` | No | Registro de usuario |
| POST | `/api/usuarios/registro-con-rol/` | No | Registro con selector egresado/estudiante |
| GET | `/api/usuarios/perfil/` | JWT | Perfil del usuario autenticado |
| GET | `/api/usuarios/disponibles/` | Admin | Usuarios sin perfil de egresado |
| GET | `/api/egresados/programas/` | No | Catálogo de programas |
| GET | `/api/egresados/departamentos/` | No | Catálogo de departamentos |
| GET | `/api/egresados/ciudades/` | No | Catálogo de ciudades (filtro por departamento) |
| GET/POST | `/api/egresados/perfilegresado/` | JWT | CRUD de perfiles de egresado |
| POST | `/api/egresados/perfilegresado/{id}/validar/` | Admin | Validar egresado + asignar rol |
| GET/PUT | `/api/egresados/perfilegresado/mi_perfil/` | JWT | Perfil propio del egresado |
| POST | `/api/egresados/perfilegresado/importacion-masiva/` | Admin | Importación masiva (Celery) |
| GET/POST | `/api/supletorios/` | JWT | CRUD de supletorios |
| GET | `/api/docs/` | No | Swagger UI |

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

Crear `.env` en la raíz del proyecto a partir de `.env.example`:

```bash
# PostgreSQL
POSTGRES_USER=pisunpa_user
POSTGRES_PASSWORD=pisunpa_secret
POSTGRES_DB=pisunpa_db

# Django
SECRET_KEY=<tu-secret-key>
JWT_SECRET_KEY=<tu-jwt-secret-key>
USE_SQLITE=False

# pgAdmin
PGADMIN_EMAIL=admin@pisunpa.com
PGADMIN_PASSWORD=admin
```

> El archivo `.env` nunca se sube al repositorio (está en `.gitignore`).

---

## Git — Ramas

El repositorio usa ramas por desarrollador:

| Rama | Desarrollador |
| :--- | :--- |
| `Dario` | Backend & Integración |
| `Duvan` | Backend |
| `Esteban` | Backend |
| `Frontend` | Frontend Angular |
| `Juan` | Backend |
| `maibackend` | Backend |

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
