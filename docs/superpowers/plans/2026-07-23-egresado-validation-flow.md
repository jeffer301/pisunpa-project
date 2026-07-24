# Plan de Implementación: Flujo de Validación de Egresados

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add egresado validation workflow — admin selects users and validates profiles, public registration with role selector, pending/validated states.

**Architecture:** Backend adds `validado` field to `PerfilEgresado`, new endpoints for user listing and validation. Frontend adds user selector to admin form, status column to table, and role selector to registration.

**Tech Stack:** Django 5.0, DRF, Angular 19, PostgreSQL (Docker)

## Global Constraints

- PostgreSQL via Docker (SQLite forbidden)
- Spanish (Colombian locale) — all UI text in Spanish
- All imports absolute (`from app.X import Y`)
- Read/write serializer asymmetry (Skill 2)
- JWT auth via `Authorization: Bearer <token>`
- `environment.apiUrl` for frontend service URLs
- UUID PKs on all models
- Run `docker compose exec backend python manage.py test app` and `docker compose exec backend flake8 app/` after each backend task
- Run `docker compose exec frontend npm run build` after each frontend task

---

### Task 1: Add `validado` field to PerfilEgresado model + migration

**Files:**
- Modify: `backend/app/egresados/models.py:56`
- Create: `backend/app/egresados/migrations/0005_perfilegresado_validado.py`

**Interfaces:**
- Consumes: existing `PerfilEgresado` model
- Produces: `PerfilEgresado.validado` boolean field (default=False)

- [ ] **Step 1: Add field to model**

In `backend/app/egresados/models.py`, add after `trabaja_actualmente`:

```python
validado = models.BooleanField(default=False)
```

- [ ] **Step 2: Create migration**

Run: `docker compose exec backend python manage.py makemigrations egresados`
Expected: `Migrations for 'egresados': ... 0005_perfilegresado_validado.py`

- [ ] **Step 3: Apply migration**

Run: `docker compose exec backend python manage.py migrate`
Expected: `Applying egresados.0005_perfilegresado_validado... OK`

- [ ] **Step 4: Verify model**

Run: `docker compose exec backend python manage.py shell -c "from app.egresados.models import PerfilEgresado; print([f.name for f in PerfilEgresado._meta.get_fields()])"`
Expected: `'validado'` in output

- [ ] **Step 5: Commit**

```bash
git add backend/app/egresados/models.py backend/app/egresados/migrations/
git commit -m "feat: add validado field to PerfilEgresado"
```

---

### Task 2: Update serializers to include `validado`

**Files:**
- Modify: `backend/app/egresados/serializers.py:64-93`

**Interfaces:**
- Consumes: `PerfilEgresado.validado` field from Task 1
- Produces: `validado` visible in read serializer, writable in write serializer

- [ ] **Step 1: Add `validado` to read serializer**

In `backend/app/egresados/serializers.py`, the `PerfilEgresadoReadSerializer` uses `fields = '__all__'` so `validado` is automatically included. No change needed for read.

- [ ] **Step 2: Add `validado` to write serializer fields list**

In `backend/app/egresados/serializers.py`, in `PerfilEgresadoWriteSerializer.Meta.fields`, add `'validado'` to the list:

```python
fields = [
    'tipo_documento', 'numero_documento', 'fecha_nacimiento',
    'telefono_celular', 'direccion_residencia', 'biografia',
    'trabaja_actualmente', 'programa_id', 'departamento_id', 'ciudad_id',
    'contacto_emergencia_nombre', 'contacto_emergencia_parentesco',
    'contacto_emergencia_telefono', 'contacto_emergencia_email',
    'validado',
]
```

- [ ] **Step 3: Run flake8**

Run: `docker compose exec backend flake8 app/egresados/serializers.py`
Expected: No errors (or only pre-existing ones)

- [ ] **Step 4: Commit**

```bash
git add backend/app/egresados/serializers.py
git commit -m "feat: include validado in egresado serializers"
```

---

### Task 3: Create endpoint `GET /api/usuarios/disponibles/`

**Files:**
- Modify: `backend/app/usuarios/views.py`
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/urls.py`

**Interfaces:**
- Consumes: `Usuario` model, `PerfilEgresado` model
- Produces: `GET /api/usuarios/disponibles/` → list of users without egresado profiles

- [ ] **Step 1: Create `UsuariosDisponiblesSerializer`**

In `backend/app/usuarios/serializers.py`, add:

```python
class UsuariosDisponiblesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'documento', 'telefono']
```

- [ ] **Step 2: Create `UsuariosDisponiblesView`**

In `backend/app/usuarios/views.py`, add:

```python
from rest_framework.permissions import BasePermission
from app.egresados.models import PerfilEgresado


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'rol', None)
            and request.user.rol.nombre in ('administrador', 'director', 'secretario')
        )


class UsuariosDisponiblesView(generics.ListAPIView):
    serializer_class = UsuariosDisponiblesSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        usuario_ids_con_perfil = PerfilEgresado.objects.values_list(
            'usuario_id', flat=True
        )
        return Usuario.objects.exclude(id__in=usuario_ids_con_perfil)
```

- [ ] **Step 3: Add URL**

In `backend/app/usuarios/urls.py`, add:

```python
from .views import (
    RegistroView,
    PerfilView,
    UsuariosDisponiblesView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("disponibles/", UsuariosDisponiblesView.as_view(), name="usuarios-disponibles"),
]
```

- [ ] **Step 4: Test endpoint**

Run: `docker compose exec backend python manage.py shell -c "
from django.test import RequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from app.usuarios.models import Usuario
admin = Usuario.objects.get(email='admin@pisunpa.com')
token = str(RefreshToken.for_user(admin).access_token)
print(token[:20] + '...')
"`
Then test with curl or shell that the endpoint returns users without profiles.

- [ ] **Step 5: Run flake8**

Run: `docker compose exec backend flake8 app/usuarios/views.py app/usuarios/serializers.py app/usuarios/urls.py`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add backend/app/usuarios/views.py backend/app/usuarios/serializers.py backend/app/usuarios/urls.py
git commit -m "feat: add usuarios disponibles endpoint for admin"
```

---

### Task 4: Create endpoint `POST /api/egresados/perfilegresado/{id}/validar/`

**Files:**
- Modify: `backend/app/egresados/views.py`
- Modify: `backend/app/egresados/urls.py`

**Interfaces:**
- Consumes: `PerfilEgresado` model, `Rol` model
- Produces: `POST /api/egresados/perfilegresado/{id}/validar/` → validates profile + assigns role

- [ ] **Step 1: Add `validar` action to `PerfilEgresadoViewSet`**

In `backend/app/egresados/views.py`, add inside the class:

```python
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def validar(self, request, pk=None):
        perfil = self.get_object()
        user = request.user

        is_admin = getattr(user, 'rol', None) and getattr(
            user.rol, 'nombre', ''
        ) in ('administrador', 'director', 'secretario')
        if not is_admin:
            return Response(
                {'detail': 'Solo administradores pueden validar egresados.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if perfil.validado:
            return Response(
                {'detail': 'Este egresado ya está validado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from app.usuarios.models import Rol
        with transaction.atomic():
            perfil.validado = True
            perfil.save(update_fields=['validado'])

            rol_egresado = Rol.objects.get(nombre='egresado')
            perfil.usuario.rol = rol_egresado
            perfil.usuario.save(update_fields=['rol'])

        return Response({'detail': 'Egresado validado exitosamente.'})
```

- [ ] **Step 2: Add `transaction` import**

At top of `backend/app/egresados/views.py`, add:

```python
from django.db import transaction
```

- [ ] **Step 3: Test endpoint**

Run: `docker compose exec backend python manage.py shell -c "
from app.egresados.models import PerfilEgresado
p = PerfilEgresado.objects.first()
if p:
    print(f'Profile: {p.id} validado={p.validado} usuario={p.usuario.email} rol={p.usuario.rol}')
else:
    print('No profiles found')
"`

- [ ] **Step 4: Run flake8**

Run: `docker compose exec backend flake8 app/egresados/views.py`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add backend/app/egresados/views.py
git commit -m "feat: add validar endpoint for egresado profiles"
```

---

### Task 5: Modify `perform_create` to support selecting existing users

**Files:**
- Modify: `backend/app/egresados/views.py:50-65`
- Modify: `backend/app/egresados/serializers.py:80-93`

**Interfaces:**
- Consumes: `PerfilEgresadoWriteSerializer`, `UsuariosDisponiblesView` data
- Produces: `perform_create` accepts optional `usuario_id` field

- [ ] **Step 1: Add `usuario_id` to write serializer**

In `backend/app/egresados/serializers.py`, in `PerfilEgresadoWriteSerializer`:

```python
class PerfilEgresadoWriteSerializer(serializers.ModelSerializer):
    programa_id = serializers.UUIDField(write_only=True, required=False)
    departamento_id = serializers.UUIDField(write_only=True, required=False)
    ciudad_id = serializers.UUIDField(write_only=True, required=False)
    usuario_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = PerfilEgresado
        fields = [
            'tipo_documento', 'numero_documento', 'fecha_nacimiento',
            'telefono_celular', 'direccion_residencia', 'biografia',
            'trabaja_actualmente', 'programa_id', 'departamento_id', 'ciudad_id',
            'contacto_emergencia_nombre', 'contacto_emergencia_parentesco',
            'contacto_emergencia_telefono', 'contacto_emergencia_email',
            'validado', 'usuario_id',
        ]
```

- [ ] **Step 2: Modify `perform_create`**

In `backend/app/egresados/views.py`, replace the `perform_create` method:

```python
    def perform_create(self, serializer):
        user = self.request.user
        is_admin = getattr(user, 'rol', None) and getattr(
            user.rol, 'nombre', ''
        ) in ('administrador', 'director', 'secretario')

        if is_admin:
            usuario_id = serializer.validated_data.get('usuario_id')
            if usuario_id:
                usuario = User.objects.get(id=usuario_id)
            else:
                from app.usuarios.models import Rol
                num_doc = serializer.validated_data.get('numero_documento', '')
                rol_egresado = Rol.objects.get(nombre='egresado')
                usuario = User.objects.create_user(
                    username=f"egresado_{num_doc}",
                    email=f"egresado_{num_doc}@pisunpa.local",
                    password='cambiar123',
                    documento=num_doc,
                    rol=rol_egresado,
                )
            serializer.save(usuario=usuario)
        else:
            serializer.save(usuario=user)
```

- [ ] **Step 3: Run flake8**

Run: `docker compose exec backend flake8 app/egresados/views.py app/egresados/serializers.py`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add backend/app/egresados/views.py backend/app/egresados/serializers.py
git commit -m "feat: support selecting existing user in egresado creation"
```

---

### Task 6: Modify registration endpoint for role selector

**Files:**
- Modify: `backend/app/usuarios/serializers.py`
- Modify: `backend/app/usuarios/views.py`
- Modify: `backend/app/usuarios/services.py`

**Interfaces:**
- Consumes: `RegistroSerializer`, `UsuarioService.registrar_usuario`
- Produces: `POST /api/usuarios/registro/` accepts `tipo_usuario` field

- [ ] **Step 1: Create `RegistroConRolSerializer`**

In `backend/app/usuarios/serializers.py`, add:

```python
class RegistroConRolSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento = serializers.CharField(max_length=20)
    telefono = serializers.CharField(max_length=20, required=False, default='')
    tipo_usuario = serializers.ChoiceField(choices=['egresado', 'estudiante'])
    # Egresado profile fields (optional)
    programa_id = serializers.UUIDField(required=False)
    direccion_residencia = serializers.CharField(max_length=255, required=False, default='')
    biografia = serializers.CharField(required=False, default='')

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value

    def validate_documento(self, value):
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este documento.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        if attrs["tipo_usuario"] == "egresado":
            if not attrs.get("programa_id"):
                raise serializers.ValidationError(
                    {"programa_id": "El programa es requerido para egresados."}
                )
        return attrs
```

- [ ] **Step 2: Create `RegistroConRolView`**

In `backend/app/usuarios/views.py`, add:

```python
from django.db import transaction
from rest_framework.views import APIView


class RegistroConRolView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from app.egresados.models import PerfilEgresado, Programa
        from app.usuarios.models import Rol

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
                telefono=data.get("telefono", ""),
            )
            usuario.set_password(data["password"])
            usuario.save()

            if data["tipo_usuario"] == "egresado":
                programa = Programa.objects.get(id=data["programa_id"])
                PerfilEgresado.objects.create(
                    usuario=usuario,
                    tipo_documento="CC",
                    numero_documento=data["documento"],
                    telefono_celular=data.get("telefono", ""),
                    direccion_residencia=data.get("direccion_residencia", ""),
                    biografia=data.get("biografia", ""),
                    programa=programa,
                    validado=False,
                )

        return Response(
            {
                "mensaje": (
                    "Registro como egresado pendiente de validación."
                    if data["tipo_usuario"] == "egresado"
                    else "Registro exitoso."
                )
            },
            status=status.HTTP_201_CREATED,
        )
```

- [ ] **Step 3: Add URL**

In `backend/app/usuarios/urls.py`, add the new route:

```python
from .views import (
    RegistroView,
    PerfilView,
    UsuariosDisponiblesView,
    RegistroConRolView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path("registro-con-rol/", RegistroConRolView.as_view(), name="registro-con-rol"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("disponibles/", UsuariosDisponiblesView.as_view(), name="usuarios-disponibles"),
]
```

- [ ] **Step 4: Run flake8**

Run: `docker compose exec backend flake8 app/usuarios/views.py app/usuarios/serializers.py app/usuarios/urls.py`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add backend/app/usuarios/views.py backend/app/usuarios/serializers.py backend/app/usuarios/urls.py
git commit -m "feat: add registration endpoint with role selector"
```

---

### Task 7: Frontend — Add `validado` to Egresado model + service methods

**Files:**
- Modify: `frontend/src/app/models/egresado.model.ts`
- Modify: `frontend/src/app/services/egresados.service.ts`
- Modify: `frontend/src/app/services/usuarios.service.ts`

**Interfaces:**
- Consumes: backend serializers from Tasks 2-6
- Produces: TypeScript interfaces and service methods matching backend

- [ ] **Step 1: Add `validado` to Egresado model**

In `frontend/src/app/models/egresado.model.ts`, add to `Egresado` interface:

```typescript
validado: boolean;
```

- [ ] **Step 2: Add service methods to `EgresadosService`**

In `frontend/src/app/services/egresados.service.ts`, add:

```typescript
  validarEgresado(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/egresados/perfilegresado/${id}/validar/`, {});
  }

  getUsuariosDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/disponibles/`);
  }
```

- [ ] **Step 3: Add registration method to `UsuariosService`**

Check if `frontend/src/app/services/usuarios.service.ts` exists. If not, create it:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  registroConRol(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/registro-con-rol/`, datos);
  }
}
```

If it exists, add the `registroConRol` method to it.

- [ ] **Step 4: Build frontend**

Run: `docker compose exec frontend npm run build`
Expected: Build successful

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/models/egresado.model.ts frontend/src/app/services/egresados.service.ts
git commit -m "feat: add validado to frontend model and service methods"
```

---

### Task 8: Frontend — Add user selector to admin egresado form

**Files:**
- Modify: `frontend/src/app/features/egresados/formulario-egresado.component.ts`
- Modify: `frontend/src/app/features/egresados/formulario-egresado.component.html`

**Interfaces:**
- Consumes: `EgresadosService.getUsuariosDisponibles()` from Task 7
- Produces: User dropdown in form, auto-fill on selection

- [ ] **Step 1: Add user selector logic to component**

In `frontend/src/app/features/egresados/formulario-egresado.component.ts`, add:

```typescript
  usuariosDisponibles: any[] = [];
  usuarioSeleccionado: any = null;

  // In ngOnInit, after loading programas:
  this.egresadosService.getUsuariosDisponibles().subscribe(u => this.usuariosDisponibles = u);

  onUsuarioSeleccionado(usuarioId: string): void {
    const usuario = this.usuariosDisponibles.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioSeleccionado = usuario;
      this.formulario.patchValue({
        numero_documento: usuario.documento,
        telefono_celular: usuario.telefono,
      });
    }
  }
```

Also add `usuario_id` to the form group:

```typescript
usuario_id: [''],
```

- [ ] **Step 2: Add user selector to template**

In `frontend/src/app/features/egresados/formulario-egresado.component.html`, add before the document fields:

```html
    <div class="campo">
      <label for="usuario_id">Seleccionar usuario existente</label>
      <select id="usuario_id" formControlName="usuario_id" (change)="onUsuarioSeleccionado($any($event.target).value)">
        <option value="">Crear nuevo usuario</option>
        @for (u of usuariosDisponibles; track u.id) {
          <option [value]="u.id">{{ u.first_name }} {{ u.last_name }} — {{ u.email }}</option>
        }
      </select>
    </div>
```

- [ ] **Step 3: Update guardar() to include usuario_id**

In `frontend/src/app/features/egresados/formulario-egresado.component.ts`, in the `guardar()` method, add `usuario_id` to the payload:

```typescript
    this.egresadosService.guardarEgresado({
      // ... existing fields ...
      usuario_id: val.usuario_id || undefined,
    } as any).subscribe({
```

- [ ] **Step 4: Build frontend**

Run: `docker compose exec frontend npm run build`
Expected: Build successful

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/egresados/formulario-egresado.component.ts frontend/src/app/features/egresados/formulario-egresado.component.html
git commit -m "feat: add user selector to admin egresado form"
```

---

### Task 9: Frontend — Add status column and validation button to admin table

**Files:**
- Modify: `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.ts`
- Modify: `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.html`

**Interfaces:**
- Consumes: `EgresadosService.validarEgresado()` from Task 7
- Produces: Status badge + validate button in table

- [ ] **Step 1: Add validation method to component**

In `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.ts`, add:

```typescript
  readonly filtroEstado = signal<string>('todos');

  readonly egresadosFiltrados = computed(() => this.egresados().filter(e => {
    const consulta = this.filtroNombre().trim().toLocaleLowerCase();
    const nombre = `${e.usuario?.first_name ?? ''} ${e.usuario?.last_name ?? ''}`.toLocaleLowerCase();
    if (consulta && !nombre.includes(consulta)) return false;
    if (this.filtroPrograma() && e.programa?.id !== String(this.filtroPrograma())) return false;
    if (this.filtroEstado() === 'pendientes' && e.validado) return false;
    if (this.filtroEstado() === 'validados' && !e.validado) return false;
    return true;
  }));

  validarEgresado(egresado: Egresado): void {
    this.egresadosService.validarEgresado(egresado.id).subscribe({
      next: () => {
        this.egresados.update(lista =>
          lista.map(e => e.id === egresado.id ? { ...e, validado: true } : e)
        );
        this.feedback.show('Egresado validado exitosamente.');
      },
      error: () => {
        this.feedback.show('Error al validar egresado.', 'error');
      }
    });
  }
```

Remove the old `egresadosFiltrados` computed (it will be replaced by the new one with `filtroEstado`).

- [ ] **Step 2: Add status filter to template**

In `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.html`, add after the program filter select:

```html
    <select aria-label="Filtrar por estado" [value]="filtroEstado()"
      (change)="filtroEstado.set($any($event.target).value)">
      <option value="todos">Todos los estados</option>
      <option value="pendientes">Pendientes</option>
      <option value="validados">Validados</option>
    </select>
```

- [ ] **Step 3: Add status column and validate button to table**

In `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.html`, add `<th>Estado</th>` to thead, and in the row:

```html
          <td>
            @if (e.validado) {
              <span class="badge badge-validado">Validado</span>
            } @else {
              <span class="badge badge-pendiente">Pendiente</span>
            }
          </td>
```

And add validate button to acciones:

```html
            @if (!e.validado) {
              <button class="btn-validar" (click)="validarEgresado(e)">Validar</button>
            }
```

- [ ] **Step 4: Add badge styles**

In `frontend/src/app/features/admin/gestion-egresados/gestion-egresados.component.ts`, add to styles:

```css
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge-pendiente {
      background: #fff3cd;
      color: #856404;
    }

    .badge-validado {
      background: #d4edda;
      color: #155724;
    }

    .btn-validar {
      background: #27ae60;
      color: #fff;
      border: none;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .btn-validar:hover {
      background: #219a52;
    }
```

- [ ] **Step 5: Build frontend**

Run: `docker compose exec frontend npm run build`
Expected: Build successful

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/features/admin/gestion-egresados/
git commit -m "feat: add status column and validate button to admin table"
```

---

### Task 10: Frontend — Add role selector to registration form

**Files:**
- Create or modify: registration component (check existing paths)
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `UsuariosService.registroConRol()` from Task 7
- Produces: Registration form with role selector

- [ ] **Step 1: Find existing registration component**

Run: `grep -r "registro" frontend/src/app/features/ --include="*.ts" -l`

- [ ] **Step 2: Create or modify registration component**

Create `frontend/src/app/features/auth/registro-rol/registro-rol.component.ts`:

```typescript
import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { EgresadosService } from '../../../services/egresados.service';
import { Programa } from '../../../models/programa.model';

@Component({
  selector: 'app-registro-rol',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registro-rol.component.html',
})
export class RegistroRolComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private egresadosService = inject(EgresadosService);
  private router = inject(Router);

  formulario!: FormGroup;
  programas: Programa[] = [];
  guardando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      documento: ['', Validators.required],
      telefono: [''],
      tipo_usuario: ['estudiante', Validators.required],
      programa_id: [''],
      direccion_residencia: [''],
      biografia: [''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);

    this.formulario.get('tipo_usuario')!.valueChanges.subscribe(tipo => {
      const prog = this.formulario.get('programa_id')!;
      if (tipo === 'egresado') {
        prog.setValidators(Validators.required);
      } else {
        prog.clearValidators();
      }
      prog.updateValueAndValidity();
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const val = this.formulario.value;
    this.usuariosService.registroConRol({
      email: val.email,
      password: val.password,
      password2: val.password2,
      first_name: val.first_name,
      last_name: val.last_name,
      documento: val.documento,
      telefono: val.telefono,
      tipo_usuario: val.tipo_usuario,
      programa_id: val.programa_id || undefined,
      direccion_residencia: val.direccion_residencia,
      biografia: val.biografia,
    }).subscribe({
      next: (res) => {
        this.guardando.set(false);
        if (val.tipo_usuario === 'egresado') {
          this.router.navigate(['/registro-pendiente']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.detail || 'Error al registrar.');
      }
    });
  }
}
```

Create `frontend/src/app/features/auth/registro-rol/registro-rol.component.html`:

```html
<div class="contenedor">
  <h2>Registro</h2>
  <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>

  @if (error()) {
    <div class="error-msg">{{ error() }}</div>
  }

  <form [formGroup]="formulario" (ngSubmit)="registrar()">

    <div class="campo">
      <label>Tipo de usuario *</label>
      <div class="campo-radio">
        <label><input type="radio" formControlName="tipo_usuario" value="estudiante" /> Estudiante</label>
        <label><input type="radio" formControlName="tipo_usuario" value="egresado" /> Egresado</label>
      </div>
    </div>

    <div class="campo">
      <label for="email">Correo electrónico *</label>
      <input id="email" type="email" formControlName="email" />
    </div>

    <div class="campo">
      <label for="first_name">Nombres *</label>
      <input id="first_name" formControlName="first_name" />
    </div>

    <div class="campo">
      <label for="last_name">Apellidos *</label>
      <input id="last_name" formControlName="last_name" />
    </div>

    <div class="campo">
      <label for="documento">Documento *</label>
      <input id="documento" formControlName="documento" />
    </div>

    <div class="campo">
      <label for="telefono">Teléfono</label>
      <input id="telefono" formControlName="telefono" />
    </div>

    <div class="campo">
      <label for="password">Contraseña *</label>
      <input id="password" type="password" formControlName="password" />
    </div>

    <div class="campo">
      <label for="password2">Confirmar contraseña *</label>
      <input id="password2" type="password" formControlName="password2" />
    </div>

    @if (formulario.get('tipo_usuario')?.value === 'egresado') {
      <fieldset>
        <legend>Datos de egresado</legend>

        <div class="campo">
          <label for="programa_id">Programa *</label>
          <select id="programa_id" formControlName="programa_id">
            <option value="">Seleccione un programa</option>
            @for (p of programas; track p.id) {
              <option [value]="p.id">{{ p.nombre }}</option>
            }
          </select>
        </div>

        <div class="campo">
          <label for="direccion_residencia">Dirección</label>
          <input id="direccion_residencia" formControlName="direccion_residencia" />
        </div>

        <div class="campo">
          <label for="biografia">Biografía</label>
          <textarea id="biografia" formControlName="biografia" rows="3"></textarea>
        </div>
      </fieldset>
    }

    <button type="submit" [disabled]="formulario.invalid || guardando()">
      {{ guardando() ? 'Registrando...' : 'Registrarse' }}
    </button>
  </form>
</div>
```

- [ ] **Step 3: Add route**

In `frontend/src/app/app.routes.ts`, add:

```typescript
{
  path: 'registro',
  loadComponent: () => import('./features/auth/registro-rol/registro-rol.component').then(m => m.RegistroRolComponent),
},
```

- [ ] **Step 4: Build frontend**

Run: `docker compose exec frontend npm run build`
Expected: Build successful

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/auth/registro-rol/ frontend/src/app/app.routes.ts
git commit -m "feat: add registration form with role selector"
```

---

### Task 11: Run full verification

**Files:** None (verification only)

- [ ] **Step 1: Run backend tests**

Run: `docker compose exec backend python manage.py test app`
Expected: All tests pass

- [ ] **Step 2: Run flake8**

Run: `docker compose exec backend flake8 app/`
Expected: No new errors

- [ ] **Step 3: Build frontend**

Run: `docker compose exec frontend npm run build`
Expected: Build successful

- [ ] **Step 4: Smoke test endpoints**

Run: `docker compose exec backend python manage.py shell -c "
from app.usuarios.models import Usuario
from app.egresados.models import PerfilEgresado
print(f'Users: {Usuario.objects.count()}')
print(f'Profiles: {PerfilEgresado.objects.count()}')
print(f'Validated: {PerfilEgresado.objects.filter(validado=True).count()}')
print(f'Pending: {PerfilEgresado.objects.filter(validado=False).count()}')
"`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete egresado validation flow"
```
