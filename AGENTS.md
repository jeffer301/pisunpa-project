# AGENTS.md

# Project Overview

**pisunpa.com** — university graduates ("egresados") and supletorios (make-up exams) management system.

- **Backend**: Django 5.0 + DRF (Python 3.12)
- **Frontend**: Angular 19 SPA (TypeScript 5.7)
- **Database**: PostgreSQL (Docker STRICTLY). SQLite is FORBIDDEN.
- **Language**: Spanish (Colombian locale) — all code, comments, routes, UI text

---

## Docker Execution & Database Migrations (STRICT ISOLATION)

All interactions with the system MUST be performed through the Docker container. Host execution is prohibited.

```bash
# Environment Bootstrapping
docker compose up -d --build

# Backend Execution (Migrations & Tests)
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py test app
docker compose exec backend flake8 app

# Frontend Execution
docker compose exec frontend npm test
```

---

## Backend Architecture Rules & Domain Invariants (SKILLS)

### Skill 1: Imports Explícitos y Namespaces en Django
- Todo import de modelos, vistas o serializadores DEBE ser absoluto, iniciando con el namespace `app.`: `from app.usuarios.models import Usuario`.
- **PROHIBIDOS** los imports relativos (`from .models import ...`).

### Skill 2: Asimetría de Serializadores (DRF)
- **PROHIBIDO** usar el mismo Serializer para operaciones de lectura (GET) y escritura (POST/PUT/PATCH).
- **Lectura**: Implementar `ReadSerializer`. Obligatorio optimizar el QuerySet del ViewSet usando `select_related()` y `prefetch_related()` para evitar el problema N+1.
- **Escritura**: Implementar `WriteSerializer`. Las operaciones de creación o actualización complejas deben estar envueltas en un bloque `with transaction.atomic():`.

### Skill 3: Desacoplamiento Asíncrono con Celery
- Ningún endpoint HTTP debe retener la respuesta para procesar operaciones I/O pesadas (ej. envío de correos, generación de PDFs, cambios masivos de estado).
- Toda lógica pesada debe encapsularse en una función decorada con `@shared_task` dentro de `app/<modulo>/tasks.py` e invocarse explícitamente mediante `.delay()` o `.apply_async()`.

### Skill 4: Trazabilidad y Auditoría de Dominio
- Cualquier modificación de estado en los flujos principales (especialmente el workflow de 8 estados de Supletorio y el perfil de Egresado) debe registrarse obligatoriamente en una bitácora de auditoría dentro de la misma transacción de base de datos.

### Skill 5: Tolerancia Cero en Pruebas y Linters
- El agente NO dará por terminada ninguna tarea de backend hasta que la ejecución de `docker compose exec web python manage.py test app` retorne exit code 0.
- Se debe resolver cualquier advertencia de PEP8 o de formato reportada por `flake8` o `black` antes de considerar la tarea lista.

---

## Frontend-Backend Integration Rules (Contract Constraints)

Para asegurar la correcta conexión entre Angular y Django, el agente debe aplicar estas directivas al tocar código de integración:

### Eliminación de Mocks y JWT Real
- Queda prohibido usar `AuthService` (MOCK). Toda petición de autenticación debe apuntar a `/api/usuarios/login/` y almacenar los tokens JWT reales (Access y Refresh).
- Toda petición HTTP al backend (excepto login/registro) debe incluir el header `Authorization: Bearer <token>` gestionado por un `HttpInterceptor` en Angular.

### Gestión de URLs (Variables de Entorno)
- **PROHIBIDO** hardcodear `http://127.0.0.1:8000/api/` en los servicios.
- Utilizar obligatoriamente `environment.apiUrl` para construir las rutas de los servicios en Angular.

### Mapeo Estricto de Interfaces TypeScript
- Los modelos en `frontend/src/app/models/` deben coincidir exactamente con la estructura de datos que emiten los `ReadSerializer` del backend.
- Campos nulos en Django (`null=True`, `blank=True`) deben mapearse como opcionales en TypeScript (`campo?: tipo`).
- Las llaves primarias siempre deben ser tratadas como cadenas (`string`), ya que el backend utiliza UUIDs.

---

## API Routes Dictionary

| Path | Purpose |
| :--- | :--- |
| `/api/usuarios/` | registro, login, refresh, perfil |
| `/api/supletorios/` | solicitud, pago, bandeja, pendientes |
| `/api/egresados/` | programas, departamentos, ciudades, perfilegresado |
| `/api/docs/` | Swagger UI |
| `/api/schema/` | OpenAPI schema |

---

## Git Branches

Multi-developer repo. Current branches: 
- `Dario`
- `Duvan`
- `Esteban`
- `Frontend`
- `Juan`
- `maibackend