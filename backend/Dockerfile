FROM python:3.12-slim

# Evita que Python genere archivos .pyc innecesarios y fuerza la salida a la consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala las dependencias del sistema operativo OBLIGATORIAS para compilar el driver de PostgreSQL
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# El servidor de desarrollo de Django 
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
