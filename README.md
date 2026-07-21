# Pisunpa Project

Repositorio monorepo del proyecto **pisunpa.com**.

## Estructura

```
├── frontend/
└── backend/
    ├── manage.py
    ├── requirements.txt
    ├── Dockerfile
    │
    ├── core_project/
    │   ├── __init__.py
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    │
    └── app/
        ├── __init__.py
        │
        ├── usuarios/
        │   ├── __init__.py
        │   ├── admin.py
        │   ├── apps.py
        │   ├── migrations/
        │   │   └── __init__.py
        │   ├── models.py
        │   ├── serializers.py
        │   ├── views.py
        │   ├── urls.py
        │   └── tests.py
        │
        ├── supletorios/
        │   ├── __init__.py
        │   ├── admin.py
        │   ├── apps.py
        │   ├── migrations/
        │   │   ├── __init__.py
        │   │   └── 0001_initial.py
        │   ├── models.py
        │   ├── serializers.py
        │   ├── views.py
        │   ├── urls.py
        │   ├── utils.py
        │   └── tests.py
        │
        └── egresados/
            ├── __init__.py
            ├── admin.py
            ├── apps.py
            ├── migrations/
            │   ├── __init__.py
            │   └── 0001_initial.py
            ├── models.py
            ├── serializers.py
            ├── views.py
            ├── urls.py
            └── tests.py

└── database/
```

##  Aviso de Refactorización Arquitectónica: Migración a Django REST Framework

Para soportar la escalabilidad de los 15 módulos proyectados sin colapsar la mantenibilidad del código, el backend ha sido reestructurado. Hemos abandonado FastAPI y la arquitectura de "Capas Técnicas" en favor de Django REST Framework (DRF) y un enfoque de **Diseño Orientado al Dominio (Domain-Driven Design)**.

### ¿Qué cambia para el equipo?

1. **Eliminación de Carpetas Globales:** Ya no existen las carpetas `models/`, `schemas/` o `routers/`. Todo el código está dividido en **Apps** (módulos independientes) dentro de la carpeta `backend/apps/`. Cada app (ej. `supletorios`, `egresados`) es un ecosistema cerrado con su propia base de datos, lógica de validación y rutas.
2. **Reemplazo de Pydantic por Serializers:** La validación de datos que antes se hacía en la carpeta `schemas/` ahora está estrictamente controlada por los archivos `serializers.py` dentro de cada módulo. Estos serializadores dictan el contrato exacto (JSON) que el frontend (Angular) debe enviar y recibir.
3. **Autenticación Estricta por JWT:** El sistema de seguridad centralizado ha sido reemplazado. Todas las peticiones desde Angular hacia endpoints protegidos DEBEN incluir el token en la cabecera: `Authorization: Bearer <tu_token>`. 
4. **Documentación como Contrato:** No se adivinarán las rutas. El contrato de la API (Swagger/OpenAPI) será autogenerado y será la única fuente de verdad para el equipo de frontend. Si un campo en el JSON no coincide con el Serializer, la petición será rechazada con un Error 400 automáticamente.

## Flujo de Trabajo Asíncrono (Celery + Redis)

Para salvaguardar la estabilidad de la API, el hilo principal de peticiones HTTP tiene prohibido ejecutar procesos pesados de cómputo o I/O. Operaciones críticas como "la importación masiva de datos académicos los viernes" o el envío de notificaciones institucionales y códigos de verificación OTP son delegadas de forma asíncrona a un clúster de Celery Workers. Redis actúa como el broker de mensajería centralizado que administra estas colas en memoria con velocidad sub-milisegundo.

## Estado actual del proyecto (actualizado)

### Backend
- Núcleo (`core_project/`): DRF, JWT (SimpleJWT), CORS y las 3 apps registradas. Base de datos en SQLite local mientras no exista Postgres real (cambia con `USE_SQLITE=False` en `.env`).
- **supletorios**: módulo funcional completo (modelo, serializers, views, admin). Endpoints protegidos con JWT.
- **egresados**: solo catálogos (`Programa`, `Departamento`, `Ciudad`) implementados y públicos. El resto del módulo (gestión, analítica) en pausa.
- **usuarios**: pendiente (Duvan) — sin esto, no hay JWT real y los endpoints de `supletorios` responden 401.
- Documentación autogenerada: `http://127.0.0.1:8000/api/docs/`

### Frontend
- Catálogos de egresados (`programas`, `departamentos`, `ciudades`) conectados por HTTP al backend real.
- `supletorio.service.ts` conectado a los 4 componentes de supletorios (solicitud, pago, bandeja, pendientes) — responde 401 hasta que exista autenticación JWT real.
- Login sigue siendo mock (`usuarios.service.ts`), no genera token válido para el backend.

### Cómo correr en desarrollo
\`\`\`bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
ng serve
\`\`\`


## Variables de entorno

Antes de levantar el proyecto, crea un archivo `.env` en la raíz (mismo nivel que `docker-compose.yml`), usando `.env.example` como referencia:

> El archivo `.env` nunca se sube al repositorio (está en `.gitignore`). Cada quien crea el suyo localmente a partir de `.env.example`.

## Arranque rápido

Levantar todo el stack:

```bash
docker compose up --build
```

Levantar solo backend, base de datos y pgAdmin mientras el frontend aún no tiene su `package.json`:

```bash
docker compose up --build backend database celery_worker redis pgadmin
```

> Nota: al levantar `backend`, Docker Compose también construye y levanta `database` automáticamente, ya que es una dependencia declarada (`depends_on`). No es necesario iniciar `database` por separado.

Esto levantará:

- **Frontend** en `http://localhost:4200`
- **Backend** en `http://localhost:8000`
- **PostgreSQL** en `http://localhost:5432`
- **Redis In-Memory Broker** en `http://localhost:6379`   
- **pgAdmin** en `http://localhost:5050`


## Conectarse a la base de datos con pgAdmin

1. Entra a `http://localhost:5050`
2. Inicia sesión con las credenciales `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` del `.env`
3. Click derecho en **Servers** → **Register** → **Server**
4. Pestaña **General**: nombre el que quieras (ej. `pisunpa-local`)
5. Pestaña **Connection**:
   - Host: nombre del servicio en Docker, no `localhost`
   - Port: los valores del `.env`
   - Maintenance database: los valores del `.env`
   - Username: los valores del `.env`
   - Password: los valores del `.env`

## Notas sobre la base de datos

Los scripts `database/init.sql` y `database/seed.sql` solo se ejecutan automáticamente la **primera vez** que se crea el volumen de PostgreSQL.

Si modificas alguno de estos scripts después de la primera ejecución, debes reiniciar el volumen para que los cambios se apliquen:

```bash
docker compose down
docker volume rm pisunpa-project_pgdata
docker compose up --build backend database pgadmin
```

⚠️ Esto borra todos los datos actuales de la base local (no afecta producción).