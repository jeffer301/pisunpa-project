#!/bin/bash
set -e

echo "==> Aplicando migraciones..."
python manage.py migrate --noinput

echo "==> Sembrando datos base..."
python manage.py seed_usuarios 2>/dev/null || true
python manage.py seed_asignaturas 2>/dev/null || true

echo "==> Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000
