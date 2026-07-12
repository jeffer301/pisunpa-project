# Pisunpa Project

Repositorio monorepo del proyecto **pisunpa.com**.

## Estructura
├── frontend/                # Angular (SPA)
├── backend/                 # Python (API)
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models/
│       │   ├── usuario.py
│       │   ├── egresado.py
│       │   ├── supletorio.py
│       │   ├── metricas.py        # KPIs de semestre
│       │   └── desarrolladores.py # equipo 
│       ├── schemas/
│       │   ├── usuario.py
│       │   ├── egresado.py
│       │   ├── supletorio.py
│       │   ├── metricas.py
│       │   └── desarrolladores.py
│       ├── routers/
│       │   ├── auth.py
│       │   ├── egresados.py
│       │   ├── supletorios.py
│       │   └── metricas.py
│       └── core/
│           └── security.py
└── database/                # PostgreSQL (init + seed)

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