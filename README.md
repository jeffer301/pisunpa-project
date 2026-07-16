# Pisunpa Project

Repositorio monorepo del proyecto **pisunpa.com**.

## Estructura

```
├── frontend/                 # Angular (SPA)
└── backend/                  # Proyecto Django
    ├── manage.py             # Interfaz de línea de comandos para administrar el proyecto
    ├── requirements.txt      # Dependencias (Django, djangorestframework, psycopg2, etc.)
    ├── config/               # El núcleo de configuración (El cerebro)
    │   ├── __init__.py
    │   ├── settings.py       # Configuración global, base de datos, JWT y registro de apps
    │   ├── urls.py           # Enrutador maestro (delegador de URLs)
    │   └── wsgi.py           # Interfaz de servidor web
    │
    └── apps/                 # DOMINIOS DE NEGOCIO (Las "Apps" modulares)
        │
        ├── usuarios/         # Módulo 1: Identidad, Roles y Desarrolladores
        │   ├── models.py     
        │   ├── serializers.py
        │   ├── views.py      
        │   └── urls.py       
        │
        ├── supletorios/      # Módulo 2: Máquina de Estados y Solicitudes
        │   ├── models.py     
        │   ├── serializers.py
        │   ├── views.py      
        │   └── urls.py       
        │
        └── egresados/        # Módulo 3: Analítica, Métricas y Seguimiento
            ├── models.py     
            ├── serializers.py
            ├── views.py      
            └── urls.py
└── database/                # PostgreSQL (init + seed)
```

##  Aviso de Refactorización Arquitectónica: Migración a Django REST Framework

Para soportar la escalabilidad de los 15 módulos proyectados sin colapsar la mantenibilidad del código, el backend ha sido reestructurado. Hemos abandonado FastAPI y la arquitectura de "Capas Técnicas" en favor de Django REST Framework (DRF) y un enfoque de **Diseño Orientado al Dominio (Domain-Driven Design)**.

### ¿Qué cambia para el equipo?

1. **Eliminación de Carpetas Globales:** Ya no existen las carpetas `models/`, `schemas/` o `routers/`. Todo el código está dividido en **Apps** (módulos independientes) dentro de la carpeta `backend/apps/`. Cada app (ej. `supletorios`, `egresados`) es un ecosistema cerrado con su propia base de datos, lógica de validación y rutas.
2. **Reemplazo de Pydantic por Serializers:** La validación de datos que antes se hacía en la carpeta `schemas/` ahora está estrictamente controlada por los archivos `serializers.py` dentro de cada módulo. Estos serializadores dictan el contrato exacto (JSON) que el frontend (Angular) debe enviar y recibir.
3. **Autenticación Estricta por JWT:** El sistema de seguridad centralizado ha sido reemplazado. Todas las peticiones desde Angular hacia endpoints protegidos DEBEN incluir el token en la cabecera: `Authorization: Bearer <tu_token>`. 
4. **Documentación como Contrato:** No se adivinarán las rutas. El contrato de la API (Swagger/OpenAPI) será autogenerado y será la única fuente de verdad para el equipo de frontend. Si un campo en el JSON no coincide con el Serializer, la petición será rechazada con un Error 400 automáticamente.

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
docker compose up --build backend database pgadmin
```

> Nota: al levantar `backend`, Docker Compose también construye y levanta `database` automáticamente, ya que es una dependencia declarada (`depends_on`). No es necesario iniciar `database` por separado.

Esto levantará:

- **Frontend** en `http://localhost:4200`
- **Backend** en `http://localhost:8000`
- **PostgreSQL** en `http://localhost:5432`
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