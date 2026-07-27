# Base de Datos SIGSRE

Sistema Integral para la Gestión, Seguimiento y Relacionamiento con Egresados

## Estructura

La base de datos contiene las siguientes tablas principales:

- **programas_academicos**: Carreras (ej: Ingeniería de Sistemas)
- **usuarios**: Docentes, administrativos, egresados
- **roles**: Roles del sistema (docente, admin, etc.)
- **usuario_roles**: Asignación de roles a usuarios
- **asignaturas**: Cursos del programa académico
- **docentes**: Perfil de docentes vinculado a usuarios
- **grupos_asignatura**: Grupos de clase con docente asignado, código de grupo y jornada

## Seeding de Datos

### Opción 1: Docker Compose (Recomendado)

El seed se ejecuta automáticamente al iniciar los contenedores:

```bash
docker-compose up
```

El archivo `database/seed.sql` se ejecuta automáticamente al crear el volumen de PostgreSQL.

### Opción 2: Regenerar seed desde Excel

Si necesitas actualizar los datos desde el archivo `Datos.xlsx`:

```bash
python database/seed_from_excel.py database/Datos.xlsx database/seed.sql
```

Esto genera un nuevo `seed.sql` con:
- 22 docentes del Excel
- 16 asignaturas normalizadas
- 22 grupos de asignatura con códigos (IS03D1, IS05N1, etc.)
- Jornadas inferidas del código (D=diurna, N=nocturna)

### Datos Cargados

El seed incluye:
- **Docentes**: 22 profesores de Ingeniería de Sistemas con correos @unipacifico.edu.co
- **Asignaturas**: Cursos normalizados (sin tildes, mayúsculas consistentes)
- **Grupos**: Vinculados a docentes, con jornada diurna/nocturna
- **Rol**: Todos los docentes tienen rol "docente"

## Normalización

El script Python normalizará automáticamente:
- ✅ Tildes y caracteres especiales
- ✅ Mayúsculas/minúsculas
- ✅ Espacios en blanco
- ✅ Códigos de grupo (IS03D1, ISO7N1, etc.)

Esto evita duplicados y mantiene consistencia en la BD.

## Llaves Foráneas (FK)

Las relaciones están configuradas con integridad referencial:

- `usuarios` ← `docentes` (FK usuario_id)
- `asignaturas` ← `grupos_asignatura` (FK asignatura_id)
- `docentes` ← `grupos_asignatura` (FK docente_id)
- `programas_academicos` ← `asignaturas` (FK programa_id)

## Variables de Entorno PostgreSQL

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pisunpa
DATABASE_URL=postgresql://postgres:postgres@database:5432/pisunpa
```

## Verificación Manual

Conectar a PostgreSQL:

```bash
psql -h localhost -U postgres -d pisunpa
```

Listar docentes:
```sql
SELECT u.email, u.nombres, u.apellidos, d.codigo_docente 
FROM docentes d JOIN usuarios u ON d.usuario_id = u.id;
```

Listar grupos de asignatura:
```sql
SELECT a.nombre, a.codigo, d.codigo_docente, ga.codigo_grupo, ga.jornada
FROM grupos_asignatura ga
JOIN asignaturas a ON ga.asignatura_id = a.id
JOIN docentes d ON ga.docente_id = d.id;
