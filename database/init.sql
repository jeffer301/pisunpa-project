-- SIGSRE - Esquema inicial de PostgreSQL
-- Sistema Integral para la Gestion, Seguimiento y Relacionamiento con Egresados
-- PostgreSQL 16+
--
-- Este archivo se ejecuta automaticamente al crear por primera vez el volumen
-- del servicio `database` de docker-compose.
-- Se ejecuta dentro de una transaccion para reforzar la atomicidad del arranque.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Tipos controlados por la base de datos para conservar datos consistentes.
CREATE TYPE estado_usuario AS ENUM ('pendiente_activacion', 'activo', 'bloqueado', 'inactivo');
CREATE TYPE estado_validacion AS ENUM ('pendiente', 'validado', 'rechazado');
CREATE TYPE visibilidad_perfil AS ENUM ('privado', 'universidad', 'empresas_autorizadas', 'publico');
CREATE TYPE modalidad_trabajo AS ENUM ('presencial', 'remoto', 'hibrido', 'proyectos', 'freelance');
CREATE TYPE tipo_contrato AS ENUM ('indefinido', 'fijo', 'prestacion_servicios', 'obra_labor', 'aprendizaje', 'temporal', 'independiente');
CREATE TYPE estado_vacante AS ENUM ('borrador', 'pendiente_aprobacion', 'publicada', 'cerrada', 'cancelada');
CREATE TYPE estado_postulacion AS ENUM ('enviada', 'en_revision', 'preseleccionada', 'entrevista', 'seleccionada', 'rechazada', 'retirada');
CREATE TYPE situacion_laboral AS ENUM ('empleado', 'independiente', 'emprendedor', 'desempleado_busca', 'desempleado_no_busca', 'estudiando', 'otro');
CREATE TYPE estado_supletorio AS ENUM ('solicitado', 'en_revision', 'aprobado', 'rechazado', 'programado', 'presentado', 'calificado', 'cancelado');

-- ---------------------------------------------------------------------------
-- Seguridad, actores y estructura academica
-- ---------------------------------------------------------------------------
CREATE TABLE programas_academicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(180) NOT NULL,
    codigo VARCHAR(30),
    nivel VARCHAR(50) NOT NULL DEFAULT 'pregrado',
    modalidad VARCHAR(50),
    sede VARCHAR(120),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (nombre),
    UNIQUE (codigo)
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    tipo_documento VARCHAR(30),
    numero_documento VARCHAR(50),
    telefono VARCHAR(30),
    estado estado_usuario NOT NULL DEFAULT 'pendiente_activacion',
    ultimo_acceso_at TIMESTAMPTZ,
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tipo_documento, numero_documento)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(100) NOT NULL UNIQUE,
    modulo VARCHAR(60) NOT NULL,
    descripcion TEXT NOT NULL
);

CREATE TABLE usuario_roles (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    asignado_por UUID REFERENCES usuarios(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE rol_permisos (
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- ---------------------------------------------------------------------------
-- Modulo: Gestion de egresados
-- ---------------------------------------------------------------------------
CREATE TABLE egresados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    programa_id UUID NOT NULL REFERENCES programas_academicos(id),
    codigo_estudiante VARCHAR(50),
    codigo_egresado VARCHAR(50) NOT NULL UNIQUE,
    fecha_grado DATE NOT NULL,
    numero_acta VARCHAR(60),
    numero_diploma VARCHAR(60),
    promedio_acumulado NUMERIC(3,2) CHECK (promedio_acumulado BETWEEN 0 AND 5),
    modalidad_estudio VARCHAR(50),
    jornada VARCHAR(50),
    estado_validacion estado_validacion NOT NULL DEFAULT 'pendiente',
    validado_por UUID REFERENCES usuarios(id),
    validado_at TIMESTAMPTZ,
    foto_url TEXT,
    biografia_profesional TEXT,
    perfil_profesional TEXT,
    ciudad_residencia VARCHAR(100),
    departamento_residencia VARCHAR(100),
    pais_residencia VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    direccion_residencia TEXT,
    barrio VARCHAR(100),
    codigo_postal VARCHAR(20),
    correo_alternativo CITEXT,
    telefono_fijo VARCHAR(30),
    whatsapp VARCHAR(30),
    visibilidad visibilidad_perfil NOT NULL DEFAULT 'universidad',
    acepta_directorio BOOLEAN NOT NULL DEFAULT false,
    acepta_contacto_empresas BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (programa_id, codigo_estudiante),
    UNIQUE (programa_id, numero_acta),
    UNIQUE (programa_id, numero_diploma)
);

CREATE TABLE preferencias_comunicacion (
    egresado_id UUID PRIMARY KEY REFERENCES egresados(id) ON DELETE CASCADE,
    recibe_email BOOLEAN NOT NULL DEFAULT true,
    recibe_sms BOOLEAN NOT NULL DEFAULT false,
    recibe_whatsapp BOOLEAN NOT NULL DEFAULT false,
    recibe_notificaciones BOOLEAN NOT NULL DEFAULT true,
    temas_interes TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contactos_emergencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(180) NOT NULL,
    parentesco VARCHAR(80),
    telefono VARCHAR(30) NOT NULL,
    email CITEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE competencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL UNIQUE,
    categoria VARCHAR(80) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE egresado_competencias (
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    competencia_id UUID NOT NULL REFERENCES competencias(id),
    nivel SMALLINT CHECK (nivel BETWEEN 1 AND 5),
    anios_experiencia NUMERIC(4,1) CHECK (anios_experiencia >= 0),
    verificada BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (egresado_id, competencia_id)
);

CREATE TABLE idiomas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE egresado_idiomas (
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    idioma_id UUID NOT NULL REFERENCES idiomas(id),
    nivel_lectura VARCHAR(30),
    nivel_escritura VARCHAR(30),
    nivel_conversacion VARCHAR(30),
    certificacion VARCHAR(180),
    PRIMARY KEY (egresado_id, idioma_id)
);

CREATE TABLE estudios_posteriores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    nivel VARCHAR(60) NOT NULL,
    programa VARCHAR(200) NOT NULL,
    institucion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    modalidad VARCHAR(50),
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('en_curso', 'finalizado', 'suspendido')),
    fecha_inicio DATE,
    fecha_fin DATE,
    titulo_obtenido VARCHAR(200),
    linea_investigacion VARCHAR(200),
    trabajo_grado TEXT,
    director_tesis VARCHAR(180),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE redes_profesionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    plataforma VARCHAR(80) NOT NULL,
    url TEXT NOT NULL,
    nombre_usuario VARCHAR(120),
    visibilidad visibilidad_perfil NOT NULL DEFAULT 'publico',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (egresado_id, plataforma, url)
);

CREATE TABLE documentos_egresado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    categoria VARCHAR(80) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    almacenamiento_url TEXT NOT NULL,
    tipo_mime VARCHAR(120),
    tamano_bytes BIGINT CHECK (tamano_bytes >= 0),
    version SMALLINT NOT NULL DEFAULT 1 CHECK (version > 0),
    visibilidad visibilidad_perfil NOT NULL DEFAULT 'privado',
    verificado_por UUID REFERENCES usuarios(id),
    verificado_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Modulo: Seguimiento laboral y academico
-- ---------------------------------------------------------------------------
CREATE TABLE sectores_economicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE organizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(30),
    sector_id UUID REFERENCES sectores_economicos(id),
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    pais VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    direccion TEXT,
    sitio_web VARCHAR(250),
    telefono VARCHAR(30),
    email_contacto CITEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE NULLS NOT DISTINCT (nit)
);

CREATE TABLE experiencias_laborales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    organizacion_id UUID REFERENCES organizaciones(id),
    empresa_nombre VARCHAR(200),
    cargo VARCHAR(180) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_retiro DATE,
    es_actual BOOLEAN NOT NULL DEFAULT false,
    modalidad modalidad_trabajo,
    contrato tipo_contrato,
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    pais VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    rango_salarial VARCHAR(30),
    responsabilidades TEXT,
    tecnologias TEXT,
    logros TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_ingreso),
    CHECK (organizacion_id IS NOT NULL OR empresa_nombre IS NOT NULL),
    CHECK (NOT es_actual OR fecha_retiro IS NULL)
);

CREATE UNIQUE INDEX ux_experiencia_actual_por_egresado
    ON experiencias_laborales (egresado_id) WHERE es_actual;

CREATE TABLE seguimientos_egresado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    registrado_por UUID REFERENCES usuarios(id),
    fecha_seguimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    situacion situacion_laboral NOT NULL,
    buscando_empleo BOOLEAN NOT NULL DEFAULT false,
    tiempo_primer_empleo_meses SMALLINT CHECK (tiempo_primer_empleo_meses >= 0),
    trabaja_en_area_formacion BOOLEAN,
    satisfaccion_laboral SMALLINT CHECK (satisfaccion_laboral BETWEEN 1 AND 5),
    observaciones TEXT,
    fuente VARCHAR(50) NOT NULL DEFAULT 'actualizacion_perfil',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Modulo: Bolsa de empleo
-- ---------------------------------------------------------------------------
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL UNIQUE REFERENCES organizaciones(id) ON DELETE CASCADE,
    usuario_responsable_id UUID REFERENCES usuarios(id),
    descripcion TEXT,
    logo_url TEXT,
    estado_validacion estado_validacion NOT NULL DEFAULT 'pendiente',
    validada_por UUID REFERENCES usuarios(id),
    validada_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vacantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    cargo VARCHAR(180),
    tipo_contrato tipo_contrato,
    modalidad modalidad_trabajo,
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    pais VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    rango_salarial VARCHAR(30),
    experiencia_minima_meses SMALLINT CHECK (experiencia_minima_meses >= 0),
    nivel_educativo VARCHAR(80),
    fecha_publicacion TIMESTAMPTZ,
    fecha_cierre DATE NOT NULL,
    estado estado_vacante NOT NULL DEFAULT 'borrador',
    creada_por UUID NOT NULL REFERENCES usuarios(id),
    aprobada_por UUID REFERENCES usuarios(id),
    aprobada_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (fecha_cierre >= created_at::date)
);

CREATE TABLE vacante_competencias (
    vacante_id UUID NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
    competencia_id UUID NOT NULL REFERENCES competencias(id),
    nivel_requerido SMALLINT CHECK (nivel_requerido BETWEEN 1 AND 5),
    obligatoria BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (vacante_id, competencia_id)
);

CREATE TABLE postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacante_id UUID NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
    egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
    estado estado_postulacion NOT NULL DEFAULT 'enviada',
    mensaje_presentacion TEXT,
    cv_documento_id UUID REFERENCES documentos_egresado(id) ON DELETE SET NULL,
    fecha_postulacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    revisada_por UUID REFERENCES usuarios(id),
    revisada_at TIMESTAMPTZ,
    observacion_empresa TEXT,
    UNIQUE (vacante_id, egresado_id)
);

CREATE TABLE postulacion_historial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postulacion_id UUID NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
    estado estado_postulacion NOT NULL,
    comentario TEXT,
    cambiado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Encuestas, auditoria y modulo de supletorios (compartido con el sistema)
-- ---------------------------------------------------------------------------
CREATE TABLE encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activa_desde TIMESTAMPTZ,
    activa_hasta TIMESTAMPTZ,
    anonima BOOLEAN NOT NULL DEFAULT false,
    creada_por UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (activa_hasta IS NULL OR activa_desde IS NULL OR activa_hasta > activa_desde)
);

CREATE TABLE preguntas_encuesta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('texto', 'numero', 'seleccion_unica', 'seleccion_multiple', 'escala', 'booleano')),
    opciones JSONB NOT NULL DEFAULT '[]'::jsonb,
    obligatoria BOOLEAN NOT NULL DEFAULT false,
    orden SMALLINT NOT NULL,
    UNIQUE (encuesta_id, orden)
);

CREATE TABLE respuestas_encuesta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    egresado_id UUID REFERENCES egresados(id) ON DELETE SET NULL,
    respondida_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE NULLS NOT DISTINCT (encuesta_id, egresado_id)
);

CREATE TABLE respuestas_pregunta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    respuesta_encuesta_id UUID NOT NULL REFERENCES respuestas_encuesta(id) ON DELETE CASCADE,
    pregunta_id UUID NOT NULL REFERENCES preguntas_encuesta(id) ON DELETE CASCADE,
    valor JSONB NOT NULL,
    UNIQUE (respuesta_encuesta_id, pregunta_id)
);

CREATE TABLE asignaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programa_id UUID NOT NULL REFERENCES programas_academicos(id),
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    creditos SMALLINT CHECK (creditos > 0),
    activa BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (programa_id, codigo)
);

CREATE TABLE docentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_docente VARCHAR(60),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grupos_asignatura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignatura_id UUID NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    codigo_grupo VARCHAR(30) NOT NULL,
    jornada VARCHAR(30) NOT NULL DEFAULT 'diurna',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (asignatura_id, codigo_grupo)
);

CREATE TABLE solicitudes_supletorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID NOT NULL REFERENCES usuarios(id),
    asignatura_id UUID NOT NULL REFERENCES asignaturas(id),
    periodo_academico VARCHAR(20) NOT NULL,
    motivo TEXT NOT NULL,
    soporte_url TEXT,
    estado estado_supletorio NOT NULL DEFAULT 'solicitado',
    fecha_presentacion TIMESTAMPTZ,
    nota NUMERIC(3,2) CHECK (nota BETWEEN 0 AND 5),
    revisada_por UUID REFERENCES usuarios(id),
    revisada_at TIMESTAMPTZ,
    observacion_revision TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (estudiante_id, asignatura_id, periodo_academico)
);

CREATE TABLE consentimientos_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(80) NOT NULL,
    version_politica VARCHAR(30) NOT NULL,
    aceptado BOOLEAN NOT NULL,
    ip INET,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auditoria (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(80) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    entidad_id UUID,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para los listados y reportes que utilizara el backend.
CREATE INDEX ix_egresados_programa ON egresados(programa_id);
CREATE INDEX ix_egresados_validacion ON egresados(estado_validacion);
CREATE INDEX ix_experiencias_egresado ON experiencias_laborales(egresado_id, fecha_ingreso DESC);
CREATE INDEX ix_seguimientos_egresado ON seguimientos_egresado(egresado_id, fecha_seguimiento DESC);
CREATE INDEX ix_vacantes_busqueda ON vacantes(estado, fecha_cierre, empresa_id);
CREATE INDEX ix_postulaciones_egresado ON postulaciones(egresado_id, fecha_postulacion DESC);
CREATE INDEX ix_documentos_egresado ON documentos_egresado(egresado_id, categoria);
CREATE INDEX ix_auditoria_entidad ON auditoria(entidad, entidad_id, created_at DESC);

-- Mantiene updated_at consistente sin depender del backend.
CREATE OR REPLACE FUNCTION establecer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_programas_updated_at BEFORE UPDATE ON programas_academicos FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_egresados_updated_at BEFORE UPDATE ON egresados FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_documentos_updated_at BEFORE UPDATE ON documentos_egresado FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_organizaciones_updated_at BEFORE UPDATE ON organizaciones FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_experiencias_updated_at BEFORE UPDATE ON experiencias_laborales FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_vacantes_updated_at BEFORE UPDATE ON vacantes FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_supletorios_updated_at BEFORE UPDATE ON solicitudes_supletorio FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_docentes_updated_at BEFORE UPDATE ON docentes FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();
CREATE TRIGGER tr_grupos_asignatura_updated_at BEFORE UPDATE ON grupos_asignatura FOR EACH ROW EXECUTE FUNCTION establecer_updated_at();

-- Roles iniciales del enunciado. No se crean usuarios ni datos simulados.
INSERT INTO roles (codigo, nombre, descripcion) VALUES
    ('administrador', 'Administrador general', 'Configuracion, seguridad y acceso total.'),
    ('director_programa', 'Director del programa', 'Consulta indicadores y aprueba contenidos.'),
    ('coordinador_egresados', 'Coordinador de egresados', 'Opera los modulos funcionales de egresados.'),
    ('administrativo', 'Personal administrativo', 'Apoyo operativo con permisos asignados.'),
    ('docente', 'Docente', 'Acceso a funciones academicas autorizadas.'),
    ('egresado', 'Egresado', 'Gestiona unicamente su informacion y servicios.'),
    ('estudiante', 'Estudiante', 'Acceso restringido a servicios para estudiantes.'),
    ('empresa', 'Empresa', 'Gestiona vacantes y postulaciones de su organizacion.')
ON CONFLICT (codigo) DO NOTHING;

-- Alcance inicial del SIGSRE: unicamente el Programa de Ingenieria de Sistemas.
INSERT INTO programas_academicos (nombre, codigo, nivel, modalidad, sede)
VALUES ('Ingenieria de Sistemas', 'ING-SIS', 'pregrado', 'presencial', 'Buenaventura')
ON CONFLICT (codigo) DO NOTHING;

COMMENT ON TABLE egresados IS 'Perfil maestro del graduado; integra los modulos de gestion, seguimiento y empleo.';
COMMENT ON TABLE seguimientos_egresado IS 'Fotografias historicas de la situacion laboral para indicadores institucionales.';
COMMENT ON TABLE vacantes IS 'Ofertas laborales publicadas por empresas validadas.';
COMMENT ON TABLE solicitudes_supletorio IS 'Solicitudes de examen supletorio; se incluye por ser un modulo existente del proyecto.';

COMMIT;
