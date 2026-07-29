# Phase 2 — Registration, Approval & Profesor-Asignatura Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement private docente registration, student approval flow, and profesor-asignatura assignment system.

**Architecture:** Backend: Django REST Framework with JWT auth. Add `estado`/`documento_identidad` to Usuario model, custom login serializer to block pending users, new endpoints for docente registration and student approval. ProfesorAsignatura intermediate model links professors to subjects. Supletorio.profesor and .asignatura change from CharField to FK.

**Tech Stack:** Django 4.x, Django REST Framework, SimpleJWT, Angular 17+ (standalone components, signals, OnPush), SQLite (dev)

## Global Constraints
- Backend: Django REST Framework with SimpleJWT, `USERNAME_FIELD = "email"`, UUID PKs
- Frontend: Angular 17+ standalone components, OnPush change detection, signals, reactive forms
- Use Spanish copy for UI text and error messages
- Institutional colors: `#0a2463` (navy), `#3da5d9` (blue), `#7ec8e3` (light blue)
- DB strategy: drop and recreate SQLite (test data only)
- Backend runs at `http://127.0.0.1:8000`, frontend at `http://localhost:4200`

---

## Task 1: Backend — Usuario Model Changes

**Files:**
- Modify: `backend/app/usuarios/models.py`
- Create: `backend/app/usuarios/migrations/0002_usuario_estado_usuario_documento_identidad.py`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `Usuario.estado`, `Usuario.documento_identidad`, `EstadoUsuario` choices

- [ ] **Step 1: Add EstadoUsuario and new fields to Usuario model**

Edit `backend/app/usuarios/models.py`:

```python
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class EstadoUsuario(models.TextChoices):
    PENDIENTE = 'pendiente_aprobacion', 'Pendiente de aprobación'
    APROBADO = 'aprobado', 'Aprobado'
    RECHAZADO = 'rechazado', 'Rechazado'


class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(
        max_length=50,
        unique=True
    )
    descripcion = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.nombre


class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(
        max_length=150,
        unique=True,
    )
    email = models.EmailField(
        unique=True
    )
    documento = models.CharField(
        max_length=20,
        unique=True
    )
    documento_identidad = models.CharField(max_length=20, blank=True, default='')
    telefono = models.CharField(
        max_length=20,
        blank=True
    )
    foto = models.ImageField(
        upload_to="usuarios/",
        null=True,
        blank=True
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoUsuario.choices,
        default=EstadoUsuario.APROBADO,
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
```

- [ ] **Step 2: Generate and apply migration**

```bash
cd backend
python manage.py makemigrations usuarios
python manage.py migrate
```

- [ ] **Step 3: Verify migration applied**

```bash
python manage.py showmigrations usuarios
```

Expected: `0002_usuario_estado_usuario_documento_identidad` shows `[X]`

- [ ] **Step 4: Commit**

```bash
git add backend/app/usuarios/models.py backend/app/usuarios/migrations/
git commit -m "feat(backend): add estado and documento_identidad fields to Usuario"
```

---

## Task 2: Backend — Custom Login Serializer (Block Pending Users)

**Files:**
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/views.py`
- Modify: `backend/app/usuarios/urls.py`

**Interfaces:**
- Consumes: `Usuario.estado` from Task 1
- Produces: `CustomTokenObtainSerializer`, `CustomTokenObtainPairView`

- [ ] **Step 1: Add CustomTokenObtainSerializer to serializers.py**

Append to `backend/app/usuarios/serializers.py`:

```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken


class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.estado == 'pendiente_aprobacion':
            raise serializers.ValidationError(
                "Tu cuenta está pendiente de aprobación por el director/administrador."
            )
        if user.estado == 'rechazado':
            raise serializers.ValidationError(
                "Tu cuenta ha sido rechazada."
            )
        return data
```

- [ ] **Step 2: Create custom token view in views.py**

Add to `backend/app/usuarios/views.py`:

```python
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer
```

- [ ] **Step 3: Update urls.py to use custom login view**

Replace the login URL in `backend/app/usuarios/urls.py`:

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegistroConRolView,
    RegistroView,
    PerfilView,
    UsuariosDisponiblesView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path(
        "registro-con-rol/",
        RegistroConRolView.as_view(),
        name="registro-con-rol",
    ),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "disponibles/",
        UsuariosDisponiblesView.as_view(),
        name="usuarios-disponibles",
    ),
]
```

- [ ] **Step 4: Start backend and test login block**

```bash
cd backend
python manage.py runserver
```

Test with curl:

```bash
# Test pending user (create one first, or test with existing)
curl -X POST http://127.0.0.1:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
```

Expected: 400 with error message about pending account

- [ ] **Step 5: Commit**

```bash
git add backend/app/usuarios/serializers.py backend/app/usuarios/views.py backend/app/usuarios/urls.py
git commit -m "feat(backend): block login for pending/rejected users"
```

---

## Task 3: Backend — Docente Registration Endpoint

**Files:**
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/views.py`
- Modify: `backend/app/usuarios/urls.py`

**Interfaces:**
- Consumes: `Rol.objects.get(nombre='profesor')`, `Usuario` model
- Produces: `POST /api/usuarios/registro-docente/`

- [ ] **Step 1: Add RegistroDocenteSerializer to serializers.py**

Append to `backend/app/usuarios/serializers.py`:

```python
class RegistroDocenteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento_identidad = serializers.CharField(max_length=20)

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value

    def validate_documento_identidad(self, value):
        if Usuario.objects.filter(documento_identidad=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este documento.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs
```

- [ ] **Step 2: Add RegistroDocenteView to views.py**

Append to `backend/app/usuarios/views.py`:

```python
from .models import Rol


class RegistroDocenteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroDocenteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            usuario = Usuario(
                username=data["email"],
                email=data["email"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                documento_identidad=data["documento_identidad"],
            )
            usuario.set_password(data["password"])
            usuario.rol = Rol.objects.get(nombre='profesor')
            usuario.estado = 'aprobado'
            usuario.save()

        return Response(
            {"mensaje": "Registro exitoso. Ya puedes iniciar sesión."},
            status=status.HTTP_201_CREATED,
        )
```

- [ ] **Step 3: Add URL to urls.py**

Add to `backend/app/usuarios/urls.py`:

```python
from .views import (
    CustomTokenObtainPairView,
    RegistroConRolView,
    RegistroDocenteView,
    RegistroView,
    PerfilView,
    UsuariosDisponiblesView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path(
        "registro-con-rol/",
        RegistroConRolView.as_view(),
        name="registro-con-rol",
    ),
    path(
        "registro-docente/",
        RegistroDocenteView.as_view(),
        name="registro-docente",
    ),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "disponibles/",
        UsuariosDisponiblesView.as_view(),
        name="usuarios-disponibles",
    ),
]
```

- [ ] **Step 4: Test docente registration**

```bash
curl -X POST http://127.0.0.1:8000/api/usuarios/registro-docente/ \
  -H "Content-Type: application/json" \
  -d '{"email":"profesor@test.com","password":"prof1234","password2":"prof1234","first_name":"Test","last_name":"Profesor","documento_identidad":"1234567890"}'
```

Expected: 201 with `{"mensaje": "Registro exitoso. Ya puedes iniciar sesión."}`

- [ ] **Step 5: Verify user created with correct role**

```bash
python manage.py shell -c "from app.usuarios.models import Usuario; u = Usuario.objects.get(email='profesor@test.com'); print(f'rol: {u.rol}, estado: {u.estado}')"
```

Expected: `rol: profesor, estado: aprobado`

- [ ] **Step 6: Commit**

```bash
git add backend/app/usuarios/serializers.py backend/app/usuarios/views.py backend/app/usuarios/urls.py
git commit -m "feat(backend): add docente registration endpoint"
```

---

## Task 4: Backend — Student Registration with Pending State

**Files:**
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/views.py`

**Interfaces:**
- Consumes: `RegistroConRolSerializer` (existing), `Usuario.estado`
- Produces: Modified `RegistroConRolView` that sets `estado='pendiente_aprobacion'` for students

- [ ] **Step 1: Add documento_identidad to RegistroConRolSerializer**

Edit `backend/app/usuarios/serializers.py` — add `documento_identidad` field to `RegistroConRolSerializer`:

```python
class RegistroConRolSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, min_length=8
    )
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento = serializers.CharField(max_length=20)
    documento_identidad = serializers.CharField(max_length=20, required=False, default='')
    telefono = serializers.CharField(
        max_length=20, required=False, default=''
    )
    tipo_usuario = serializers.ChoiceField(
        choices=['egresado', 'estudiante']
    )
    programa_id = serializers.UUIDField(required=False)
    direccion_residencia = serializers.CharField(
        max_length=255, required=False, default='', allow_blank=True
    )
    biografia = serializers.CharField(
        required=False, default='', allow_blank=True
    )
```

- [ ] **Step 2: Update RegistroConRolView to set estado for students**

Edit `backend/app/usuarios/views.py` — modify `RegistroConRolView.post()`:

```python
class RegistroConRolView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroConRolSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            usuario = Usuario(
                username=data["email"],
                email=data["email"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                documento=data["documento"],
                documento_identidad=data.get("documento_identidad", ""),
                telefono=data.get("telefono", ""),
            )
            usuario.set_password(data["password"])

            if data["tipo_usuario"] == "estudiante":
                usuario.estado = "pendiente_aprobacion"

            usuario.save()

            if data["tipo_usuario"] == "egresado":
                programa = Programa.objects.get(
                    id=data["programa_id"]
                )
                PerfilEgresado.objects.create(
                    usuario=usuario,
                    tipo_documento="CC",
                    numero_documento=data["documento"],
                    telefono_celular=data.get("telefono", ""),
                    direccion_residencia=data.get(
                        "direccion_residencia", ""
                    ),
                    biografia=data.get("biografia", ""),
                    programa=programa,
                    validado=False,
                )

        return Response(
            {
                "mensaje": (
                    "Registro como egresado pendiente de "
                    "validación."
                    if data["tipo_usuario"] == "egresado"
                    else "Tu cuenta está pendiente de aprobación por el director/administrador."
                )
            },
            status=status.HTTP_201_CREATED,
        )
```

- [ ] **Step 3: Test student registration**

```bash
curl -X POST http://127.0.0.1:8000/api/usuarios/registro-con-rol/ \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@test.com","password":"est12345","password2":"est12345","first_name":"Test","last_name":"Estudiante","documento":"11111111","documento_identidad":"CC 11111111","tipo_usuario":"estudiante"}'
```

Expected: 201 with pending message

- [ ] **Step 4: Verify student cannot login**

```bash
curl -X POST http://127.0.0.1:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@test.com","password":"est12345"}'
```

Expected: 400 with "Tu cuenta está pendiente de aprobación..."

- [ ] **Step 5: Commit**

```bash
git add backend/app/usuarios/serializers.py backend/app/usuarios/views.py
git commit -m "feat(backend): student registration sets pending approval state"
```

---

## Task 5: Backend — Student Approval Endpoints

**Files:**
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/views.py`
- Modify: `backend/app/usuarios/urls.py`

**Interfaces:**
- Consumes: `Usuario.estado`, `IsAdminUser` permission
- Produces: `GET /api/usuarios/estudiantes-pendientes/`, `PATCH /api/usuarios/usuarios/{id}/aprobar/`, `PATCH /api/usuarios/usuarios/{id}/rechazar/`

- [ ] **Step 1: Add EstudiantePendienteSerializer to serializers.py**

Append to `backend/app/usuarios/serializers.py`:

```python
class EstudiantePendienteSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'documento', 'documento_identidad', 'estado', 'creado']

    def get_rol(self, obj):
        if obj.rol:
            return obj.rol.nombre
        return None
```

- [ ] **Step 2: Add approval views to views.py**

Append to `backend/app/usuarios/views.py`:

```python
from .serializers import EstudiantePendienteSerializer


class EstudiantesPendientesView(generics.ListAPIView):
    serializer_class = EstudiantePendienteSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Usuario.objects.filter(estado='pendiente_aprobacion').order_by('-creado')


class AprobarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        usuario.estado = 'aprobado'
        usuario.save()
        return Response({"mensaje": "Estudiante aprobado correctamente"})


class RechazarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        usuario.estado = 'rechazado'
        usuario.save()
        return Response({"mensaje": "Estudiante rechazado"})
```

- [ ] **Step 3: Add URLs to urls.py**

Add to `backend/app/usuarios/urls.py`:

```python
from .views import (
    AprobarEstudianteView,
    CustomTokenObtainPairView,
    EstudiantesPendientesView,
    RegistroConRolView,
    RegistroDocenteView,
    RegistroView,
    RechazarEstudianteView,
    PerfilView,
    UsuariosDisponiblesView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path(
        "registro-con-rol/",
        RegistroConRolView.as_view(),
        name="registro-con-rol",
    ),
    path(
        "registro-docente/",
        RegistroDocenteView.as_view(),
        name="registro-docente",
    ),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "disponibles/",
        UsuariosDisponiblesView.as_view(),
        name="usuarios-disponibles",
    ),
    path(
        "estudiantes-pendientes/",
        EstudiantesPendientesView.as_view(),
        name="estudiantes-pendientes",
    ),
    path(
        "usuarios/<uuid:pk>/aprobar/",
        AprobarEstudianteView.as_view(),
        name="aprobar-estudiante",
    ),
    path(
        "usuarios/<uuid:pk>/rechazar/",
        RechazarEstudianteView.as_view(),
        name="rechazar-estudiante",
    ),
]
```

- [ ] **Step 4: Test pending students endpoint**

```bash
# Login as admin first
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pisunpa.com","password":"admin123"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

# List pending students
curl -X GET http://127.0.0.1:8000/api/usuarios/estudiantes-pendientes/ \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List containing the test estudiante

- [ ] **Step 5: Test approve endpoint**

```bash
# Get student ID from previous response, then:
curl -X PATCH http://127.0.0.1:8000/api/usuarios/usuarios/{STUDENT_ID}/aprobar/ \
  -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with success message

- [ ] **Step 6: Verify student can now login**

```bash
curl -X POST http://127.0.0.1:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@test.com","password":"est12345"}'
```

Expected: 200 with JWT tokens

- [ ] **Step 7: Commit**

```bash
git add backend/app/usuarios/serializers.py backend/app/usuarios/views.py backend/app/usuarios/urls.py
git commit -m "feat(backend): add student approval endpoints"
```

---

## Task 6: Backend — ProfesorAsignatura Model

**Files:**
- Modify: `backend/app/egresados/models.py`
- Create: `backend/app/egresados/migrations/0005_profesorasignatura.py`

**Interfaces:**
- Consumes: `Usuario` model, `Asignatura` model
- Produces: `ProfesorAsignatura` model

- [ ] **Step 1: Add ProfesorAsignatura model to egresados/models.py**

Append to `backend/app/egresados/models.py`:

```python
class ProfesorAsignatura(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profesor = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.CASCADE,
        related_name='asignaturas_dictadas'
    )
    asignatura = models.ForeignKey(
        Asignatura,
        on_delete=models.CASCADE,
        related_name='profesores_asignados'
    )

    class Meta:
        unique_together = ['profesor', 'asignatura']
        ordering = ['asignatura__nombre']

    def __str__(self):
        return f"{self.profesor.email} - {self.asignatura.nombre}"
```

- [ ] **Step 2: Generate and apply migration**

```bash
cd backend
python manage.py makemigrations egresados
python manage.py migrate
```

- [ ] **Step 3: Verify migration**

```bash
python manage.py showmigrations egresados
```

Expected: `0005_profesorasignatura` shows `[X]`

- [ ] **Step 4: Commit**

```bash
git add backend/app/egresados/models.py backend/app/egresados/migrations/
git commit -m "feat(backend): add ProfesorAsignatura model"
```

---

## Task 7: Backend — Supletorio FK Changes

**Files:**
- Modify: `backend/app/supletorios/models.py`
- Modify: `backend/app/supletorios/serializers.py`

**Interfaces:**
- Consumes: `Usuario` model, `Asignatura` model
- Produces: Modified `Supletorio` model with FK fields

- [ ] **Step 1: Update Supletorio model to use FKs**

Edit `backend/app/supletorios/models.py`:

```python
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings

from app.egresados.models import Asignatura, Programa


class EstadoSupletorio(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    EN_REVISION = 'en_revision', 'En revisión'
    APROBADA = 'aprobada', 'Aprobada'
    RECHAZADA = 'rechazada', 'Rechazada'
    FORMATO_PENDIENTE = 'formato_pendiente', 'Formato pendiente'
    COMPROBANTE_SUBIDO = 'comprobante_subido', 'Comprobante subido'
    NOTIFICADO_PROFESOR = 'notificado_profesor', 'Notificado al profesor'
    REALIZADO = 'realizado', 'Realizado'


class Supletorio(models.Model):
    DIAS_LIMITE = 5
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE,
            related_name='supletorios'
        )
    estudiante_nombre = models.CharField(max_length=150)
    estudiante_email = models.EmailField()

    fecha_parcial = models.DateField()
    fecha_solicitud = models.DateField(default=timezone.localdate)

    profesor = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='supletorios_como_profesor'
    )
    asignatura = models.ForeignKey(
        Asignatura,
        on_delete=models.PROTECT,
        related_name='supletorios'
    )
    grupo = models.CharField(max_length=50)

    programa = models.ForeignKey(
        Programa, on_delete=models.PROTECT, null=True, blank=True
    )
    programa_nombre = models.CharField(max_length=150, blank=True)

    descripcion = models.TextField()
    nota_revision = models.TextField(blank=True, default='')

    estado = models.CharField(max_length=30, choices=EstadoSupletorio.choices, default=EstadoSupletorio.PENDIENTE)

    comprobante_pago = models.FileField(upload_to='comprobantes_pago/', null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def excede_plazo(self):
        return (self.fecha_solicitud - self.fecha_parcial).days > self.DIAS_LIMITE

    def __str__(self):
        return f'{self.estudiante_nombre} - {self.asignatura.nombre} ({self.estado})'


class AnexoSupletorio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supletorio = models.ForeignKey(Supletorio, related_name='anexos', on_delete=models.CASCADE)
    archivo = models.FileField(upload_to='anexos_supletorios/')
    subido_en = models.DateTimeField(auto_now_add=True)
```

- [ ] **Step 2: Drop and recreate database**

```bash
cd backend
rm db.sqlite3
python manage.py migrate
```

- [ ] **Step 3: Re-seed asignaturas**

```bash
python manage.py seed_asignaturas
```

Expected: `Asignaturas: 54 creadas, 0 ya existentes (total: 54)`

- [ ] **Step 4: Update Supletorio serializers for FK fields**

Edit `backend/app/supletorios/serializers.py` — find the `SupletorioSerializer` and update the `profesor` and `asignatura` fields to use PrimaryKeyRelatedField or StringRelatedField as appropriate. The key change is that `profesor` and `asignatura` are now FKs, so the serializer needs to handle UUID IDs instead of strings.

- [ ] **Step 5: Commit**

```bash
git add backend/app/supletorios/models.py backend/app/supletorios/serializers.py
git commit -m "feat(backend): change Supletorio.profesor and .asignatura to FKs"
```

---

## Task 8: Backend — ProfesorAsignatura Endpoints

**Files:**
- Modify: `backend/app/egresados/serializers.py`
- Modify: `backend/app/egresados/views.py`
- Modify: `backend/app/egresados/urls.py`

**Interfaces:**
- Consumes: `ProfesorAsignatura` model, `Usuario` model, `Asignatura` model
- Produces: CRUD endpoints for profesor-asignatura assignments

- [ ] **Step 1: Add serializers to egresados/serializers.py**

Append to `backend/app/egresados/serializers.py`:

```python
from app.usuarios.models import Usuario


class ProfesorAsignaturaSerializer(serializers.ModelSerializer):
    profesor_email = serializers.CharField(source='profesor.email', read_only=True)
    profesor_nombre = serializers.SerializerMethodField()
    asignatura_nombre = serializers.CharField(source='asignatura.nombre', read_only=True)

    class Meta:
        model = ProfesorAsignatura
        fields = ['id', 'profesor', 'profesor_email', 'profesor_nombre', 'asignatura', 'asignatura_nombre']

    def get_profesor_nombre(self, obj):
        return f"{obj.profesor.first_name} {obj.profesor.last_name}".strip()


class ProfesorAsignaturaWriteSerializer(serializers.Serializer):
    profesor_id = serializers.UUIDField()
    asignatura_id = serializers.UUIDField()

    def validate_profesor_id(self, value):
        try:
            usuario = Usuario.objects.get(pk=value)
            if not usuario.rol or usuario.rol.nombre != 'profesor':
                raise serializers.ValidationError("El usuario no tiene rol de profesor")
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Profesor no encontrado")
        return value

    def validate_asignatura_id(self, value):
        try:
            Asignatura.objects.get(pk=value)
        except Asignatura.DoesNotExist:
            raise serializers.ValidationError("Asignatura no encontrada")
        return value

    def validate(self, attrs):
        if ProfesorAsignatura.objects.filter(
            profesor_id=attrs['profesor_id'],
            asignatura_id=attrs['asignatura_id']
        ).exists():
            raise serializers.ValidationError("Esta asignación ya existe")
        return attrs
```

- [ ] **Step 2: Add views to egresados/views.py**

Append to `backend/app/egresados/views.py`:

```python
from app.usuarios.views import IsAdminUser
from app.usuarios.models import Usuario


class ProfesorAsignaturaListView(generics.ListAPIView):
    serializer_class = ProfesorAsignaturaSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = ProfesorAsignatura.objects.all()


class ProfesorAsignaturaCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = ProfesorAsignaturaWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        asignacion = ProfesorAsignatura.objects.create(
            profesor_id=data['profesor_id'],
            asignatura_id=data['asignatura_id']
        )
        return Response(
            ProfesorAsignaturaSerializer(asignacion).data,
            status=status.HTTP_201_CREATED
        )


class ProfesorAsignaturaDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        try:
            asignacion = ProfesorAsignatura.objects.get(pk=pk)
        except ProfesorAsignatura.DoesNotExist:
            return Response(
                {"error": "Asignación no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        asignacion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfesoresPorAsignaturaView(generics.ListAPIView):
    serializer_class = UsuariosDisponiblesSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        asignatura_id = self.request.query_params.get('asignatura_id')
        if not asignatura_id:
            return Usuario.objects.none()
        profesor_ids = ProfesorAsignatura.objects.filter(
            asignatura_id=asignatura_id
        ).values_list('profesor_id', flat=True)
        return Usuario.objects.filter(id__in=profesor_ids)
```

- [ ] **Step 3: Add URLs to egresados/urls.py**

Edit `backend/app/egresados/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramaListView, AsignaturaListView,
    DepartamentoListView, CiudadListView, PerfilEgresadoViewSet,
    ProfesorAsignaturaListView, ProfesorAsignaturaCreateView,
    ProfesorAsignaturaDeleteView, ProfesoresPorAsignaturaView,
)

router = DefaultRouter()
router.register(r'perfilegresado', PerfilEgresadoViewSet, basename='perfil-egresado')

urlpatterns = [
    path('programas/', ProgramaListView.as_view(), name='programas-list'),
    path('asignaturas/', AsignaturaListView.as_view(), name='asignaturas-list'),
    path('departamentos/', DepartamentoListView.as_view(), name='departamentos-list'),
    path('ciudades/', CiudadListView.as_view(), name='ciudades-list'),
    path('profesor-asignaturas/', ProfesorAsignaturaListView.as_view(), name='profesor-asignaturas-list'),
    path('profesor-asignaturas/create/', ProfesorAsignaturaCreateView.as_view(), name='profesor-asignaturas-create'),
    path('profesor-asignaturas/<uuid:pk>/delete/', ProfesorAsignaturaDeleteView.as_view(), name='profesor-asignaturas-delete'),
    path('profesores-por-asignatura/', ProfesoresPorAsignaturaView.as_view(), name='profesores-por-asignatura'),
    path('', include(router.urls)),
]
```

- [ ] **Step 4: Test profesor-asignatura endpoints**

```bash
# Login as admin
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pisunpa.com","password":"admin123"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

# Get first asignatura ID
ASIG_ID=$(curl -s http://127.0.0.1:8000/api/egresados/asignaturas/ | python -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")

# Get first profesor ID (from task 3 test)
PROF_ID=$(curl -s http://127.0.0.1:8000/api/usuarios/disponibles/ -H "Authorization: Bearer $TOKEN" | python -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")

# Create assignment
curl -X POST http://127.0.0.1:8000/api/egresados/profesor-asignaturas/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"profesor_id\":\"$PROF_ID\",\"asignatura_id\":\"$ASIG_ID\"}"
```

Expected: 201 with assignment data

- [ ] **Step 5: Test filter endpoint**

```bash
curl -X GET "http://127.0.0.1:8000/api/egresados/profesores-por-asignatura/?asignatura_id=$ASIG_ID"
```

Expected: List containing the assigned profesor

- [ ] **Step 6: Commit**

```bash
git add backend/app/egresados/serializers.py backend/app/egresados/views.py backend/app/egresados/urls.py
git commit -m "feat(backend): add profesor-asignatura CRUD endpoints"
```

---

## Task 9: Frontend — Update Usuario Model

**Files:**
- Modify: `frontend/src/app/models/usuario.model.ts`

**Interfaces:**
- Consumes: `Usuario` interface
- Produces: Updated `Usuario` with `estado` and `documento_identidad`

- [ ] **Step 1: Update usuario.model.ts**

Edit `frontend/src/app/models/usuario.model.ts`:

```typescript
export type Rol = 'administrador' | 'director' | 'secretario' | 'profesor' | 'egresado' | 'estudiante';

export interface Usuario {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  documento: string;
  documento_identidad?: string;
  telefono: string;
  foto?: string;
  rol: Rol | null;
  estado?: 'pendiente_aprobacion' | 'aprobado' | 'rechazado';
  creado?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/models/usuario.model.ts
git commit -m "feat(frontend): add estado and documento_identidad to Usuario model"
```

---

## Task 10: Frontend — RegistroDocenteComponent

**Files:**
- Create: `frontend/src/app/features/registro-docente/registro-docente.component.ts`

**Interfaces:**
- Consumes: `POST /api/usuarios/registro-docente/`
- Produces: `/registro/docente` route

- [ ] **Step 1: Create the component**

Create `frontend/src/app/features/registro-docente/registro-docente.component.ts`:

```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Registro de Docente</h2>
      <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>

      @if (mensajeExito()) {
        <div class="aviso-exito">
          {{ mensajeExito() }}
          <a routerLink="/login">Ir al inicio de sesión</a>
        </div>
      }

      @if (mensajeError()) {
        <div class="aviso-error">{{ mensajeError() }}</div>
      }

      @if (!mensajeExito()) {
        <form [formGroup]="formulario" (ngSubmit)="registrar()">
          <div class="campo">
            <label for="first_name">Nombres *</label>
            <input id="first_name" formControlName="first_name" placeholder="Nombres" />
            @if (campoInvalido('first_name')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="last_name">Apellidos *</label>
            <input id="last_name" formControlName="last_name" placeholder="Apellidos" />
            @if (campoInvalido('last_name')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="email">Correo electrónico *</label>
            <input id="email" type="email" formControlName="email" placeholder="correo@ejemplo.com" />
            @if (campoInvalido('email')) {
              <span class="error">Ingrese un correo válido.</span>
            }
          </div>

          <div class="campo">
            <label for="documento_identidad">Documento de Identidad *</label>
            <input id="documento_identidad" formControlName="documento_identidad" placeholder="Número de documento" />
            @if (campoInvalido('documento_identidad')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="password">Contraseña *</label>
            <input id="password" type="password" formControlName="password" placeholder="Mínimo 8 caracteres" />
            @if (campoInvalido('password')) {
              <span class="error">Mínimo 8 caracteres.</span>
            }
          </div>

          <div class="campo">
            <label for="password2">Confirmar contraseña *</label>
            <input id="password2" type="password" formControlName="password2" placeholder="Repita la contraseña" />
            @if (campoInvalido('password2')) {
              <span class="error">Las contraseñas no coinciden.</span>
            }
          </div>

          <button type="submit" [disabled]="formulario.invalid || guardando()">
            {{ guardando() ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
      }

      <div class="enlaces">
        <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor {
      max-width: 480px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h2 {
      color: #0a2463;
      text-align: center;
      margin-bottom: 0.25rem;
    }
    .subtitulo {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .campo {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
    }
    input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 2px rgba(61,165,217,0.2);
    }
    .error {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #0a2463;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .aviso-exito {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 1rem;
    }
    .aviso-exito a {
      display: block;
      margin-top: 0.5rem;
      color: #0a2463;
      font-weight: 600;
    }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .enlaces {
      text-align: center;
      margin-top: 1rem;
    }
    .enlaces a {
      color: #3da5d9;
      text-decoration: none;
    }
  `]
})
export class RegistroDocenteComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  formulario: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento_identidad: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  registrar(): void {
    if (this.formulario.invalid) return;
    this.guardando.set(true);
    this.mensajeError.set('');

    this.http.post(`${environment.apiUrl}/usuarios/registro-docente/`, this.formulario.value)
      .subscribe({
        next: () => {
          this.mensajeExito.set('Registro exitoso. Ya puedes iniciar sesión.');
          this.guardando.set(false);
        },
        error: (err) => {
          const msg = err.error?.detail || err.error?.mensaje || 'Error al registrar. Intente nuevamente.';
          this.mensajeError.set(msg);
          this.guardando.set(false);
        }
      });
  }
}
```

- [ ] **Step 2: Add route to app.routes.ts**

Edit `frontend/src/app/app.routes.ts` — add the route:

```typescript
import { RegistroDocenteComponent } from './features/registro-docente/registro-docente.component';

// Add to routes array:
{ path: 'registro/docente', component: RegistroDocenteComponent },
```

- [ ] **Step 3: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/registro-docente/ frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add docente registration component"
```

---

## Task 11: Frontend — RegistroEstudianteComponent

**Files:**
- Create: `frontend/src/app/features/registro-estudiante/registro-estudiante.component.ts`

**Interfaces:**
- Consumes: `POST /api/usuarios/registro-con-rol/` with `tipo_usuario='estudiante'`
- Produces: `/registro/estudiante` route

- [ ] **Step 1: Create the component**

Create `frontend/src/app/features/registro-estudiante/registro-estudiante.component.ts`:

```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Registro de Estudiante</h2>
      <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>

      @if (mensajeExito()) {
        <div class="aviso-exito">
          <strong>{{ mensajeExito() }}</strong>
          <p>Tu cuenta será revisada por el director o administrador. Recibirás acceso una vez sea aprobada.</p>
        </div>
      }

      @if (mensajeError()) {
        <div class="aviso-error">{{ mensajeError() }}</div>
      }

      @if (!mensajeExito()) {
        <form [formGroup]="formulario" (ngSubmit)="registrar()">
          <div class="campo">
            <label for="first_name">Nombres *</label>
            <input id="first_name" formControlName="first_name" placeholder="Nombres" />
            @if (campoInvalido('first_name')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="last_name">Apellidos *</label>
            <input id="last_name" formControlName="last_name" placeholder="Apellidos" />
            @if (campoInvalido('last_name')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="email">Correo electrónico *</label>
            <input id="email" type="email" formControlName="email" placeholder="correo@ejemplo.com" />
            @if (campoInvalido('email')) {
              <span class="error">Ingrese un correo válido.</span>
            }
          </div>

          <div class="campo">
            <label for="documento_identidad">Documento de Identidad (C.C. / T.I.) *</label>
            <input id="documento_identidad" formControlName="documento_identidad" placeholder="Ej: CC 1234567890" />
            @if (campoInvalido('documento_identidad')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

          <div class="campo">
            <label for="password">Contraseña *</label>
            <input id="password" type="password" formControlName="password" placeholder="Mínimo 8 caracteres" />
            @if (campoInvalido('password')) {
              <span class="error">Mínimo 8 caracteres.</span>
            }
          </div>

          <div class="campo">
            <label for="password2">Confirmar contraseña *</label>
            <input id="password2" type="password" formControlName="password2" placeholder="Repita la contraseña" />
            @if (campoInvalido('password2')) {
              <span class="error">Las contraseñas no coinciden.</span>
            }
          </div>

          <button type="submit" [disabled]="formulario.invalid || guardando()">
            {{ guardando() ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
      }

      <div class="enlaces">
        <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor {
      max-width: 480px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h2 {
      color: #0a2463;
      text-align: center;
      margin-bottom: 0.25rem;
    }
    .subtitulo {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .campo {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
    }
    input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 2px rgba(61,165,217,0.2);
    }
    .error {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #0a2463;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .aviso-exito {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .aviso-exito strong {
      display: block;
      margin-bottom: 0.5rem;
    }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .enlaces {
      text-align: center;
      margin-top: 1rem;
    }
    .enlaces a {
      color: #3da5d9;
      text-decoration: none;
    }
  `]
})
export class RegistroEstudianteComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  formulario: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento_identidad: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  registrar(): void {
    if (this.formulario.invalid) return;
    this.guardando.set(true);
    this.mensajeError.set('');

    const body = {
      ...this.formulario.value,
      tipo_usuario: 'estudiante',
      documento: this.formulario.value.documento_identidad,
    };

    this.http.post(`${environment.apiUrl}/usuarios/registro-con-rol/`, body)
      .subscribe({
        next: () => {
          this.mensajeExito.set('Tu cuenta está pendiente de aprobación por el director/administrador.');
          this.guardando.set(false);
        },
        error: (err) => {
          const msg = err.error?.detail || err.error?.mensaje || 'Error al registrar. Intente nuevamente.';
          this.mensajeError.set(msg);
          this.guardando.set(false);
        }
      });
  }
}
```

- [ ] **Step 2: Add route to app.routes.ts**

Edit `frontend/src/app/app.routes.ts`:

```typescript
import { RegistroEstudianteComponent } from './features/registro-estudiante/registro-estudiante.component';

// Add to routes array:
{ path: 'registro/estudiante', component: RegistroEstudianteComponent },
```

- [ ] **Step 3: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/registro-estudiante/ frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add student registration component"
```

---

## Task 12: Frontend — EstudiantesPendientesComponent

**Files:**
- Create: `frontend/src/app/features/admin/estudiantes-pendientes/estudiantes-pendientes.component.ts`

**Interfaces:**
- Consumes: `GET /api/usuarios/estudiantes-pendientes/`, `PATCH /api/usuarios/usuarios/{id}/aprobar/`, `PATCH /api/usuarios/usuarios/{id}/rechazar/`
- Produces: Admin panel tab

- [ ] **Step 1: Create the component**

Create `frontend/src/app/features/admin/estudiantes-pendientes/estudiantes-pendientes.component.ts`:

```typescript
import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-estudiantes-pendientes',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Estudiantes Pendientes de Aprobación</h2>

      @if (cargando()) {
        <p class="cargando">Cargando...</p>
      }

      @if (!cargando() && estudiantes().length === 0) {
        <div class="vacio">
          <p>No hay estudiantes pendientes de aprobación.</p>
        </div>
      }

      @if (!cargando() && estudiantes().length > 0) {
        <div class="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Documento</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (est of estudiantes(); track est.id) {
                <tr>
                  <td>{{ est.first_name }} {{ est.last_name }}</td>
                  <td>{{ est.email }}</td>
                  <td>{{ est.documento_identidad }}</td>
                  <td>{{ est.creado | date:'dd/MM/yyyy' }}</td>
                  <td class="acciones">
                    <button class="btn-aprobar" (click)="aprobar(est.id)">Aprobar</button>
                    <button class="btn-rechazar" (click)="rechazar(est.id)">Rechazar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor {
      padding: 1.5rem;
    }
    h2 {
      color: #0a2463;
      margin-bottom: 1rem;
    }
    .cargando {
      color: #666;
      text-align: center;
      padding: 2rem;
    }
    .vacio {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
    .tabla-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #0a2463;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .acciones {
      display: flex;
      gap: 0.5rem;
    }
    .btn-aprobar {
      padding: 0.4rem 0.8rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-aprobar:hover {
      background: #218838;
    }
    .btn-rechazar {
      padding: 0.4rem 0.8rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-rechazar:hover {
      background: #c82333;
    }
  `]
})
export class EstudiantesPendientesComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  estudiantes = signal<Usuario[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarPendientes();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('pisunpa_access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarPendientes(): void {
    this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios/estudiantes-pendientes/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.estudiantes.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  aprobar(id: string): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/aprobar/`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.estudiantes.update(lista => lista.filter(e => e.id !== id));
      }
    });
  }

  rechazar(id: string): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/rechazar/`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.estudiantes.update(lista => lista.filter(e => e.id !== id));
      }
    });
  }
}
```

- [ ] **Step 2: Add route to app.routes.ts**

Edit `frontend/src/app/app.routes.ts`:

```typescript
import { EstudiantesPendientesComponent } from './features/admin/estudiantes-pendientes/estudiantes-pendientes.component';

// Add to routes array:
{ path: 'admin/estudiantes-pendientes', component: EstudiantesPendientesComponent,
  canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
```

- [ ] **Step 3: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/estudiantes-pendientes/ frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add estudiantes pendientes admin component"
```

---

## Task 13: Frontend — AsignacionProfesoresComponent

**Files:**
- Create: `frontend/src/app/features/admin/asignacion-profesores/asignacion-profesores.component.ts`

**Interfaces:**
- Consumes: `GET /api/egresados/profesor-asignaturas/`, `POST /api/egresados/profesor-asignaturas/create/`, `DELETE /api/egresados/profesor-asignaturas/{id}/delete/`, `GET /api/egresados/asignaturas/`, `GET /api/usuarios/disponibles/`
- Produces: Admin panel tab

- [ ] **Step 1: Create the component**

Create `frontend/src/app/features/admin/asignacion-profesores/asignacion-profesores.component.ts`:

```typescript
import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Asignatura } from '../../../models/asignatura.model';

interface AsignacionProfesor {
  id: string;
  profesor: string;
  profesor_email: string;
  profesor_nombre: string;
  asignatura: string;
  asignatura_nombre: string;
}

interface Profesor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-asignacion-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Asignación Profesor - Asignatura</h2>

      <div class="layout">
        <div class="formulario-asignar">
          <h3>Nueva Asignación</h3>

          <div class="campo">
            <label>Asignatura</label>
            <select [(ngModel)]="asignaturaSeleccionada">
              <option [value]="''" disabled>Seleccione una asignatura</option>
              @for (a of asignaturas(); track a.id) {
                <option [value]="a.id">{{ a.nombre }}</option>
              }
            </select>
          </div>

          <div class="campo">
            <label>Profesor</label>
            <select [(ngModel)]="profesorSeleccionado" [disabled]="!asignaturaSeleccionada">
              <option [value]="''" disabled>Seleccione un profesor</option>
              @for (p of profesores(); track p.id) {
                <option [value]="p.id">{{ p.first_name }} {{ p.last_name }} ({{ p.email }})</option>
              }
            </select>
          </div>

          @if (mensajeExito()) {
            <div class="aviso-exito">{{ mensajeExito() }}</div>
          }
          @if (mensajeError()) {
            <div class="aviso-error">{{ mensajeError() }}</div>
          }

          <button (click)="asignar()" [disabled]="!asignaturaSeleccionada || !profesorSeleccionado || guardando()">
            {{ guardando() ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>

        <div class="lista-asignaciones">
          <h3>Asignaciones Actuales</h3>

          @if (asignaciones().length === 0) {
            <p class="vacio">No hay asignaciones registradas.</p>
          }

          @for (asig of asignaciones(); track asig.id) {
            <div class="asignacion-item">
              <div class="asignacion-info">
                <strong>{{ asig.asignatura_nombre }}</strong>
                <span>{{ asig.profesor_nombre }} ({{ asig.profesor_email }})</span>
              </div>
              <button class="btn-eliminar" (click)="eliminar(asig.id)">Eliminar</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenedor {
      padding: 1.5rem;
    }
    h2 {
      color: #0a2463;
      margin-bottom: 1.5rem;
    }
    h3 {
      color: #333;
      margin-bottom: 1rem;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
    .campo {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
    }
    select {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    select:focus {
      outline: none;
      border-color: #3da5d9;
    }
    button {
      padding: 0.6rem 1.2rem;
      background: #0a2463;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .aviso-exito {
      background: #d4edda;
      color: #155724;
      padding: 0.5rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.5rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .vacio {
      color: #666;
      font-style: italic;
    }
    .asignacion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
    .asignacion-info {
      display: flex;
      flex-direction: column;
    }
    .asignacion-info span {
      font-size: 0.85rem;
      color: #666;
    }
    .btn-eliminar {
      padding: 0.4rem 0.8rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-eliminar:hover {
      background: #c82333;
    }
  `]
})
export class AsignacionProfesoresComponent implements OnInit {
  private http = inject(HttpClient);

  asignaturas = signal<Asignatura[]>([]);
  profesores = signal<Profesor[]>([]);
  asignaciones = signal<AsignacionProfesor[]>([]);

  asignaturaSeleccionada = '';
  profesorSeleccionado = '';
  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  ngOnInit(): void {
    this.cargarDatos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('pisunpa_access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarDatos(): void {
    this.http.get<Asignatura[]>(`${environment.apiUrl}/egresados/asignaturas/`).subscribe({
      next: (data) => this.asignaturas.set(data)
    });
    this.http.get<Profesor[]>(`${environment.apiUrl}/usuarios/disponibles/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.profesores.set(data)
    });
    this.http.get<AsignacionProfesor[]>(`${environment.apiUrl}/egresados/profesor-asignaturas/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => this.asignaciones.set(data)
    });
  }

  asignar(): void {
    if (!this.asignaturaSeleccionada || !this.profesorSeleccionado) return;
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.http.post(`${environment.apiUrl}/egresados/profesor-asignaturas/create/`, {
      profesor_id: this.profesorSeleccionado,
      asignatura_id: this.asignaturaSeleccionada,
    }, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.asignaciones.update(lista => [...lista, data as AsignacionProfesor]);
        this.mensajeExito.set('Asignación creada correctamente');
        this.profesorSeleccionado = '';
        this.guardando.set(false);
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (err) => {
        const msg = err.error?.detail || 'Error al crear la asignación';
        this.mensajeError.set(msg);
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: string): void {
    this.http.delete(`${environment.apiUrl}/egresados/profesor-asignaturas/${id}/delete/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.asignaciones.update(lista => lista.filter(a => a.id !== id));
      }
    });
  }
}
```

- [ ] **Step 2: Add route to app.routes.ts**

Edit `frontend/src/app/app.routes.ts`:

```typescript
import { AsignacionProfesoresComponent } from './features/admin/asignacion-profesores/asignacion-profesores.component';

// Add to routes array:
{ path: 'admin/asignacion-profesores', component: AsignacionProfesoresComponent,
  canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
```

- [ ] **Step 3: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/asignacion-profesores/ frontend/src/app/app.routes.ts
git commit -m "feat(frontend): add asignacion profesores admin component"
```

---

## Task 14: Frontend — Update Solicitud Supletorio Form

**Files:**
- Modify: `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.ts`
- Modify: `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.html`
- Modify: `frontend/src/app/services/egresados.service.ts`

**Interfaces:**
- Consumes: `GET /api/egresados/profesores-por-asignatura/?asignatura_id=X`
- Produces: Dynamic profesor dropdown filtered by asignatura

- [ ] **Step 1: Add getProfesoresPorAsignatura to EgresadosService**

Edit `frontend/src/app/services/egresados.service.ts`:

```typescript
getProfesoresPorAsignatura(asignaturaId: string): Observable<Usuario[]> {
  return this.http.get<Usuario[]>(`${this.apiUrl}/egresados/profesores-por-asignatura/?asignatura_id=${asignaturaId}`);
}
```

Add the import for `Usuario` at the top of the file.

- [ ] **Step 2: Update solicitud-supletorio.component.ts**

Edit `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.ts`:

Add signals for profesores:

```typescript
profesores = signal<Usuario[]>([]);
```

Update the `onAsignaturaChange` method (or add it if not present):

```typescript
onAsignaturaChange(asignaturaId: string): void {
  this.formulario.patchValue({ profesor: '' });
  if (!asignaturaId) {
    this.profesores.set([]);
    return;
  }
  this.egresadosService.getProfesoresPorAsignatura(asignaturaId).subscribe({
    next: (profesores) => this.profesores.set(profesores),
    error: () => this.profesores.set([])
  });
}
```

- [ ] **Step 3: Update the HTML template**

Edit `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.html`:

Change the asignatura field to trigger `onAsignaturaChange`:

```html
<div class="campo">
  <label for="asignatura">Asignatura *</label>
  <select id="asignatura" formControlName="asignatura" (change)="onAsignaturaChange($any($event.target).value)">
    <option [value]="null" disabled>Seleccione una asignatura</option>
    @for (a of asignaturas; track a.id) {
      <option [value]="a.id">{{ a.nombre }}</option>
    }
  </select>
  @if (campoInvalido('asignatura')) {
    <span class="error">Campo obligatorio.</span>
  }
</div>
```

Change the profesor field from `<input>` to `<select>`:

```html
<div class="campo">
  <label for="profesor">Profesor *</label>
  <select id="profesor" formControlName="profesor">
    <option [value]="''" disabled>Seleccione un profesor</option>
    @for (p of profesores(); track p.id) {
      <option [value]="p.first_name + ' ' + p.last_name">{{ p.first_name }} {{ p.last_name }}</option>
    }
  </select>
  @if (profesores().length === 0 && formulario.get('asignatura')?.value) {
    <span class="error">No hay profesores asignados a esta materia.</span>
  }
  @if (campoInvalido('profesor')) {
    <span class="error">Campo obligatorio.</span>
  }
</div>
```

- [ ] **Step 4: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/estudiante/solicitud-supletorio/ frontend/src/app/services/egresados.service.ts
git commit -m "feat(frontend): dynamic profesor filter in solicitud form"
```

---

## Task 15: Frontend — Update Login Component for Error Messages

**Files:**
- Modify: `frontend/src/app/features/login/login.component.ts`

**Interfaces:**
- Consumes: 403 response from `/api/usuarios/login/`
- Produces: Warning banner with backend error message

- [ ] **Step 1: Add error message signal and update login error handling**

Edit `frontend/src/app/features/login/login.component.ts`:

Add a signal for the warning message:

```typescript
mensajeAdvertencia = signal('');
```

Update the login error handler to catch 403:

```typescript
error: (err) => {
  if (err.status === 403 || (err.error && typeof err.error === 'string')) {
    this.mensajeAdvertencia.set(err.error || 'Acceso denegado');
  } else {
    this.mensajeError.set('Credenciales incorrectas. Intente nuevamente.');
  }
  this.cargando.set(false);
}
```

- [ ] **Step 2: Add warning banner to the template**

In the login component template, add before the form:

```html
@if (mensajeAdvertencia()) {
  <div class="aviso-advertencia">
    {{ mensajeAdvertencia() }}
  </div>
}
```

Add styles for the warning:

```css
.aviso-advertencia {
  background: #fff3cd;
  color: #856404;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #ffc107;
}
```

- [ ] **Step 3: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/login/login.component.ts
git commit -m "feat(frontend): handle 403 login error messages"
```

---

## Task 16: Frontend — Admin Panel Navigation Links

**Files:**
- Modify: `frontend/src/app/features/admin/admin.component.ts`

**Interfaces:**
- Consumes: Admin component
- Produces: Sidebar links to new admin views

- [ ] **Step 1: Add navigation links to admin sidebar**

Edit `frontend/src/app/features/admin/admin.component.ts` — find the sidebar/tabs section and add:

```html
<a routerLink="/admin/estudiantes-pendientes" routerLinkActive="active">
  Estudiantes Pendientes
</a>
<a routerLink="/admin/asignacion-profesores" routerLinkActive="active">
  Asignación Profesores
</a>
```

- [ ] **Step 2: Build and verify**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/admin/admin.component.ts
git commit -m "feat(frontend): add admin panel navigation links"
```

---

## Task 17: End-to-End Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Start backend**

```bash
cd backend
python manage.py runserver
```

- [ ] **Step 2: Start frontend**

```bash
cd frontend
npx ng serve
```

- [ ] **Step 3: Test docente registration**

Navigate to `http://localhost:4200/registro/docente` and submit the form.

Expected: Success message, redirect to login

- [ ] **Step 4: Test student registration**

Navigate to `http://localhost:4200/registro/estudiante` and submit the form.

Expected: Pending approval message

- [ ] **Step 5: Test login block**

Try to login with the pending student credentials.

Expected: Warning message "Tu cuenta está pendiente de aprobación..."

- [ ] **Step 6: Test admin approval**

Login as admin, navigate to `/admin/estudiantes-pendientes`, click "Aprobar".

Expected: Student removed from list, can now login

- [ ] **Step 7: Test profesor-asignatura assignment**

Login as admin, navigate to `/admin/asignacion-profesores`, create an assignment.

Expected: Assignment appears in list

- [ ] **Step 8: Test solicitud form filtering**

Login as student, navigate to `/estudiante/solicitud-supletorio`, select an asignatura.

Expected: Profesor dropdown populates with assigned professors

- [ ] **Step 9: Final build verification**

```bash
cd frontend
npx ng build
```

Expected: Build succeeds with no errors

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 - registration, approval, profesor-asignatura"
```
