# Phase 3 — Holiday Logic, Notifications & Grading: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add business-day logic, a notification center, exam scheduling, and grading to the pisunpa supletorio workflow.

**Architecture:** Three subsystems — (1) a pure-utility business-days module shared by backend/frontend, (2) a DB-backed notification system with a centralized service, and (3) new Supletorio fields + endpoints for scheduling/grading. Notifications are triggered by existing and new state-transition endpoints.

**Tech Stack:** Django REST Framework, SimpleJWT, SQLite, Angular 17+ (standalone components, signals, OnPush), TypeScript, global CSS with CSS variables.

## Global Constraints

- `AUTH_USER_MODEL = 'usuarios.Usuario'` — UUID PKs, `USERNAME_FIELD = "email"`
- `USE_SQLITE = True` (dev), `TIME_ZONE = 'America/Bogota'`
- Frontend: standalone components, `ChangeDetectionStrategy.OnPush`, Angular signals
- Frontend API base: `environment.apiUrl` = `http://127.0.0.1:8000/api`
- Frontend auth: `pisunpa_access_token` in localStorage, `authInterceptor` adds Bearer
- Backend default auth: `JWTAuthentication`, default permission: `IsAuthenticated`
- URLs: supletorios use `<int:pk>` (existing bug — do NOT fix in this phase)
- camelCase in serializers to match Angular (`fechaParcial`, `estadoSolicitud`, etc.)
- No new npm dependencies
- No SCSS — global CSS + inline styles only
- Bundle budget: 500 kB warning

---

## File Structure

### Backend — New Files
| File | Responsibility |
|------|---------------|
| `app/supletorios/business_days.py` | Colombian holidays set, `es_dia_habil`, `dias_habiles_entre`, `agregar_dias_habiles` |
| `app/usuarios/models.py` (extend) | Add `Notificacion` model |
| `app/usuarios/notification_service.py` | `NotificacionService` — crear, marcar_leida, contar, obtener |
| `app/usuarios/serializers.py` (extend) | Add `NotificacionSerializer` |
| `app/usuarios/views.py` (extend) | Add notification endpoints |
| `app/supletorios/serializers.py` (extend) | Add `AgendarExamenSerializer`, `CalificarExamenSerializer` |
| `app/supletorios/views.py` (extend) | Add `AgendarExamenView`, `CalificarExamenView`, wire notifications |

### Backend — Modified Files
| File | Changes |
|------|---------|
| `app/supletorios/models.py` | Add `fecha_examen_supletorio`, `nota`, `nota_observaciones`, `fecha_programacion`, `programado_por` |
| `app/supletorios/urls.py` | Add schedule/grade routes |
| `app/usuarios/urls.py` | Add notification routes |

### Frontend — New Files
| File | Responsibility |
|------|---------------|
| `src/app/core/utils/business-days.ts` | Mirror of backend business-day logic |
| `src/app/models/notificacion.model.ts` | `Notificacion` interface |
| `src/app/core/services/notification.service.ts` | HTTP service for notifications |
| `src/app/shared/components/notification-bell/notification-bell.component.ts` | Bell + dropdown panel |

### Frontend — Modified Files
| File | Changes |
|------|---------|
| `src/app/models/supletorio.model.ts` | Add new fields to interfaces |
| `src/app/features/profesor/supletorios-pendientes/supletorios-pendientes.component.ts` | API integration + schedule/grade modals |
| `src/app/features/estudiante/pago-supletorio/pago-supletorio.component.ts` | Add fecha examen + nota columns |
| `src/app/features/admin/bandeja-supletorios/bandeja-supletorios.component.ts` | Add fecha examen + nota columns |
| `src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.ts` | Business-day validation |
| `src/app/app.component.html` | Add notification bell to navbar |
| `src/app/app.component.ts` | Inject NotificationService, trigger initial load |

---

## Tasks

### Task 1: Business Days Service (Backend)

**Files:**
- Create: `backend/app/supletorios/business_days.py`
- Test: `backend/app/supletorios/tests.py`

**Interfaces:**
- Consumes: nothing
- Produces: `es_dia_habil(fecha: date) -> bool`, `dias_habiles_entre(inicio: date, fin: date) -> int`, `agregar_dias_habiles(fecha: date, n: int) -> date`

- [ ] **Step 1: Write failing tests**

```python
# backend/app/supletorios/tests.py
from datetime import date
from django.test import TestCase
from .business_days import es_dia_habil, dias_habiles_entre, agregar_dias_habiles


class EsDiaHabilTest(TestCase):
    def test_weekday_not_holiday_is_habil(self):
        # Wednesday 2025-07-16 — no holiday
        self.assertTrue(es_dia_habil(date(2025, 7, 16)))

    def test_saturday_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 7, 19)))

    def test_sunday_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 7, 20)))

    def test_colombian_holiday_is_not_habil(self):
        # July 20 — Día de la Independencia
        self.assertFalse(es_dia_habil(date(2025, 7, 20)))

    def test_new_years_day_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 1, 1)))


class DiasHabilesEntreTest(TestCase):
    def test_five_weekdays_returns_5(self):
        # Mon Jul 14 to Fri Jul 18 = 5 business days
        result = dias_habiles_entre(date(2025, 7, 14), date(2025, 7, 19))
        self.assertEqual(result, 5)

    def test_excludes_weekend(self):
        # Mon Jul 14 to Mon Jul 21 = 5 business days (Mon-Fri, skip Sat/Sun)
        result = dias_habiles_entre(date(2025, 7, 14), date(2025, 7, 21))
        self.assertEqual(result, 5)

    def test_same_date_returns_0(self):
        result = dias_habiles_entre(date(2025, 7, 16), date(2025, 7, 16))
        self.assertEqual(result, 0)


class AgregarDiasHabilesTest(TestCase):
    def test_add_5_days_from_monday(self):
        # Mon Jul 14 + 5 = next Mon Jul 21
        result = agregar_dias_habiles(date(2025, 7, 14), 5)
        self.assertEqual(result, date(2025, 7, 21))

    def test_add_1_day_from_friday(self):
        # Fri Jul 18 + 1 = next Mon Jul 21 (skip weekend)
        result = agregar_dias_habiles(date(2025, 7, 18), 1)
        self.assertEqual(result, date(2025, 7, 21))
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && python manage.py test app.supletorios.tests -v2`
Expected: ImportError — cannot import `business_days`

- [ ] **Step 3: Implement business_days.py**

```python
# backend/app/supletorios/business_days.py
from datetime import date, timedelta

COLOMBIAN_HOLIDAYS: set[date] = {
    # 2025
    date(2025, 1, 1),    # Año Nuevo
    date(2025, 1, 6),    # Día de los Reyes Magos
    date(2025, 3, 24),   # Lunes Santo
    date(2025, 4, 17),   # Jueves Santo
    date(2025, 4, 18),   # Viernes Santo
    date(2025, 5, 1),    # Día del Trabajo
    date(2025, 5, 26),   # Ascensión del Señor
    date(2025, 6, 16),   # Corpus Christi
    date(2025, 6, 23),   # Sagrado Corazón
    date(2025, 6, 29),   # San Pedro y San Pablo
    date(2025, 7, 20),   # Día de la Independencia
    date(2025, 8, 7),    # Batalla de Boyacá
    date(2025, 8, 18),   # Asunción de la Virgen
    date(2025, 10, 13),  # Día de la Raza
    date(2025, 11, 3),   # Todos los Santos
    date(2025, 11, 17),  # Independencia de Cartagena
    date(2025, 12, 8),   # Inmaculada Concepción
    date(2025, 12, 25),  # Navidad
    # 2026
    date(2026, 1, 1),    # Año Nuevo
    date(2026, 1, 12),   # Día de los Reyes Magos
    date(2026, 3, 23),   # Lunes Santo
    date(2026, 4, 2),    # Jueves Santo
    date(2026, 4, 3),    # Viernes Santo
    date(2026, 5, 1),    # Día del Trabajo
    date(2026, 6, 8),    # Ascensión del Señor
    date(2026, 6, 29),   # Corpus Christi
    date(2026, 7, 6),    # Sagrado Corazón
    date(2026, 7, 20),   # Día de la Independencia
    date(2026, 8, 7),    # Batalla de Boyacá
    date(2026, 8, 24),   # Asunción de la Virgen
    date(2026, 10, 12),  # Día de la Raza
    date(2026, 11, 2),   # Todos los Santos
    date(2026, 11, 16),  # Independencia de Cartagena
    date(2026, 12, 8),   # Inmaculada Concepción
    date(2026, 12, 25),  # Navidad
}


def es_dia_habil(fecha: date) -> bool:
    return fecha.weekday() < 5 and fecha not in COLOMBIAN_HOLIDAYS


def dias_habiles_entre(fecha_inicio: date, fecha_fin: date) -> int:
    count = 0
    actual = fecha_inicio
    while actual < fecha_fin:
        if es_dia_habil(actual):
            count += 1
        actual += timedelta(days=1)
    return count


def agregar_dias_habiles(fecha: date, n: int) -> date:
    resultado = fecha
    agregados = 0
    while agregados < n:
        resultado += timedelta(days=1)
        if es_dia_habil(resultado):
            agregados += 1
    return resultado
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python manage.py test app.supletorios.tests -v2`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/supletorios/business_days.py backend/app/supletorios/tests.py
git commit -m "feat(backend): add business days service with Colombian holidays"
```

---

### Task 2: Supletorio Model Changes + Migration

**Files:**
- Modify: `backend/app/supletorios/models.py:20-58` (add fields to `Supletorio`)
- Create: migration via `makemigrations`

**Interfaces:**
- Consumes: nothing
- Produces: `Supletorio.fecha_examen_supletorio`, `.nota`, `.nota_observaciones`, `.fecha_programacion`, `.programado_por`

- [ ] **Step 1: Add new fields to Supletorio model**

```python
# backend/app/supletorios/models.py — add these fields inside Supletorio class, after comprobante_pago (line 48)
    fecha_examen_supletorio = models.DateField(null=True, blank=True)
    nota = models.IntegerField(null=True, blank=True)
    nota_observaciones = models.TextField(blank=True, default='')
    fecha_programacion = models.DateTimeField(null=True, blank=True)
    programado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='supletorios_programados'
    )
```

- [ ] **Step 2: Generate migration**

Run: `cd backend && python manage.py makemigrations supletorios`
Expected: Creates `0005_supletorio_fecha_examen_supletorio_...py`

- [ ] **Step 3: Apply migration**

Run: `cd backend && python manage.py migrate`
Expected: OK

- [ ] **Step 4: Verify existing tests still pass**

Run: `cd backend && python manage.py test app.supletorios.tests app.usuarios.tests -v2`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/supletorios/models.py backend/app/supletorios/migrations/
git commit -m "feat(backend): add scheduling and grading fields to Supletorio model"
```

---

### Task 3: Notificacion Model + Migration

**Files:**
- Modify: `backend/app/usuarios/models.py` (add `Notificacion` class)
- Create: migration via `makemigrations`

**Interfaces:**
- Consumes: `Usuario` model (FK)
- Produces: `Notificacion` model with `crear()`, `leido`, `tipo`, `supletorio` FK

- [ ] **Step 1: Add Notificacion model**

```python
# backend/app/usuarios/models.py — add at the bottom, after the Usuario class
import uuid  # already imported

class Notificacion(models.Model):
    class TipoNotificacion(models.TextChoices):
        SOLICITUD_CREADA = 'solicitud_creada', 'Solicitud Creada'
        SOLICITUD_APROBADA = 'solicitud_aprobada', 'Solicitud Aprobada'
        SOLICITUD_RECHAZADA = 'solicitud_rechazada', 'Solicitud Rechazada'
        PAGO_CONFIRMADO = 'pago_confirmado', 'Pago Confirmado'
        EXAMEN_AGENDADO = 'examen_agendado', 'Examen Agendado'
        EXAMEN_CALIFICADO = 'examen_calificado', 'Examen Calificado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=30, choices=TipoNotificacion.choices)
    leido = models.BooleanField(default=False)
    supletorio = models.ForeignKey(
        'supletorios.Supletorio',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='notificaciones'
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f'{self.tipo}: {self.titulo} ({self.usuario})'
```

Note: `settings` is not imported in `usuarios/models.py`. Add `from django.conf import settings` at the top.

- [ ] **Step 2: Generate and apply migration**

Run: `cd backend && python manage.py makemigrations usuarios && python manage.py migrate`
Expected: Creates migration, applies cleanly

- [ ] **Step 3: Commit**

```bash
git add backend/app/usuarios/models.py backend/app/usuarios/migrations/
git commit -m "feat(backend): add Notificacion model"
```

---

### Task 4: NotificacionService

**Files:**
- Create: `backend/app/usuarios/notification_service.py`
- Test: `backend/app/usuarios/tests.py` (append)

**Interfaces:**
- Consumes: `Notificacion` model, `Usuario` model
- Produces: `NotificacionService.crear()`, `.marcar_como_leida()`, `.contar_no_leidas()`, `.obtener_notificaciones()`

- [ ] **Step 1: Write failing tests**

```python
# backend/app/usuarios/tests.py — append at bottom
from .models import Notificacion, Usuario, Rol
from .notification_service import NotificacionService


class NotificacionServiceTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='estudiante')
        self.user = Usuario.objects.create_user(
            username='test@test.com', email='test@test.com',
            password='test1234', documento='111', estado='aprobado',
            rol=self.rol
        )

    def test_crear_notificacion(self):
        notif = NotificacionService.crear(
            usuario=self.user,
            titulo='Test',
            mensaje='Mensaje de prueba',
            tipo='solicitud_creada'
        )
        self.assertEqual(notif.titulo, 'Test')
        self.assertFalse(notif.leido)

    def test_contar_no_leidas(self):
        NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        NotificacionService.crear(self.user, 'N2', 'm2', 'solicitud_aprobada')
        self.assertEqual(NotificacionService.contar_no_leidas(self.user), 2)

    def test_marcar_como_leida(self):
        notif = NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        result = NotificacionService.marcar_como_leida(str(notif.id), self.user)
        self.assertTrue(result)
        notif.refresh_from_db()
        self.assertTrue(notif.leido)

    def test_obtener_solo_no_leidas(self):
        n1 = NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        NotificacionService.crear(self.user, 'N2', 'm2', 'solicitud_aprobada')
        NotificacionService.marcar_como_leida(str(n1.id), self.user)
        qs = NotificacionService.obtener_notificaciones(self.user, solo_no_leidas=True)
        self.assertEqual(qs.count(), 1)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && python manage.py test app.usuarios.tests.NotificacionServiceTest -v2`
Expected: ImportError — cannot import `NotificacionService`

- [ ] **Step 3: Implement NotificacionService**

```python
# backend/app/usuarios/notification_service.py
from django.db.models import QuerySet
from .models import Notificacion, Usuario


class NotificacionService:
    @staticmethod
    def crear(usuario: Usuario, titulo: str, mensaje: str, tipo: str, supletorio=None) -> Notificacion:
        return Notificacion.objects.create(
            usuario=usuario,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            supletorio=supletorio,
        )

    @staticmethod
    def marcar_como_leida(notificacion_id: str, usuario: Usuario) -> bool:
        updated = Notificacion.objects.filter(
            id=notificacion_id, usuario=usuario
        ).update(leido=True)
        return updated > 0

    @staticmethod
    def contar_no_leidas(usuario: Usuario) -> int:
        return Notificacion.objects.filter(usuario=usuario, leido=False).count()

    @staticmethod
    def obtener_notificaciones(usuario: Usuario, solo_no_leidas: bool = False) -> QuerySet:
        qs = Notificacion.objects.filter(usuario=usuario)
        if solo_no_leidas:
            qs = qs.filter(leido=False)
        return qs
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python manage.py test app.usuarios.tests.NotificacionServiceTest -v2`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/usuarios/notification_service.py backend/app/usuarios/tests.py
git commit -m "feat(backend): add NotificacionService with CRUD operations"
```

---

### Task 5: Notification Serializer + List/Count Endpoints

**Files:**
- Modify: `backend/app/usuarios/serializers.py` (add `NotificacionSerializer`)
- Modify: `backend/app/usuarios/views.py` (add 4 notification views)
- Modify: `backend/app/usuarios/urls.py` (add 4 routes)

**Interfaces:**
- Consumes: `NotificacionService` (Task 4)
- Produces: `GET /api/usuarios/notificaciones/`, `GET .../contar-no-leidas/`, `PATCH .../{id}/leer/`, `POST .../leer-todas/`

- [ ] **Step 1: Add NotificacionSerializer**

```python
# backend/app/usuarios/serializers.py — append at bottom
from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    supletorio_id = serializers.UUIDField(source='supletorio.id', read_only=True, default=None)

    class Meta:
        model = Notificacion
        fields = ['id', 'titulo', 'mensaje', 'tipo', 'leido', 'supletorio_id', 'creado_en']
        read_only_fields = ['id', 'titulo', 'mensaje', 'tipo', 'leido', 'supletorio_id', 'creado_en']
```

- [ ] **Step 2: Add notification views**

```python
# backend/app/usuarios/views.py — append at bottom
from .models import Notificacion
from .serializers import NotificacionSerializer
from .notification_service import NotificacionService


class NotificacionListView(generics.ListAPIView):
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        return NotificacionService.obtener_notificaciones(self.request.user)


class NotificacionContarNoLeidasView(APIView):
    def get(self, request):
        count = NotificacionService.contar_no_leidas(request.user)
        return Response({'count': count})


class NotificacionMarcarLeidaView(APIView):
    def patch(self, request, pk):
        updated = NotificacionService.marcar_como_leida(pk, request.user)
        if not updated:
            return Response({'detail': 'Notificación no encontrada'}, status=404)
        return Response({'detail': 'Marcada como leída'})


class NotificacionLeerTodasView(APIView):
    def post(self, request):
        Notificacion.objects.filter(usuario=request.user, leido=False).update(leido=True)
        return Response({'detail': 'Todas marcadas como leídas'})
```

- [ ] **Step 3: Add URL routes**

```python
# backend/app/usuarios/urls.py — add these imports and routes
from .views import (
    # ... existing imports ...
    NotificacionListView,
    NotificacionContarNoLeidasView,
    NotificacionMarcarLeidaView,
    NotificacionLeerTodasView,
)

urlpatterns = [
    # ... existing routes ...
    path("notificaciones/", NotificacionListView.as_view(), name="notificaciones-list"),
    path("notificaciones/contar-no-leidas/", NotificacionContarNoLeidasView.as_view(), name="notificaciones-contar"),
    path("notificaciones/<uuid:pk>/leer/", NotificacionMarcarLeidaView.as_view(), name="notificaciones-leer"),
    path("notificaciones/leer-todas/", NotificacionLeerTodasView.as_view(), name="notificaciones-leer-todas"),
]
```

- [ ] **Step 4: Write and run tests**

```python
# backend/app/usuarios/tests.py — append
class NotificacionEndpointTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            username='api@test.com', email='api@test.com',
            password='test1234', documento='222', estado='aprobado'
        )
        self.client.force_authenticate(user=self.user)
        self.notif = NotificacionService.crear(
            self.user, 'Test', 'Mensaje', 'solicitud_creada'
        )

    def test_list_notifications(self):
        response = self.client.get('/api/usuarios/notificaciones/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)

    def test_contar_no_leidas(self):
        response = self.client.get('/api/usuarios/notificaciones/contar-no-leidas/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)

    def test_marcar_leida(self):
        response = self.client.patch(f'/api/usuarios/notificaciones/{self.notif.id}/leer/')
        self.assertEqual(response.status_code, 200)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.leido)

    def test_leer_todas(self):
        response = self.client.post('/api/usuarios/notificaciones/leer-todas/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Notificacion.objects.filter(usuario=self.user, leido=False).count(), 0)

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/usuarios/notificaciones/')
        self.assertEqual(response.status_code, 401)
```

Run: `cd backend && python manage.py test app.usuarios.tests.NotificacionEndpointTest -v2`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/usuarios/serializers.py backend/app/usuarios/views.py backend/app/usuarios/urls.py backend/app/usuarios/tests.py
git commit -m "feat(backend): add notification list, count, mark-read endpoints"
```

---

### Task 6: Schedule Exam Endpoint

**Files:**
- Modify: `backend/app/supletorios/serializers.py` (add `AgendarExamenSerializer`)
- Modify: `backend/app/supletorios/views.py` (add `AgendarExamenView`)
- Modify: `backend/app/supletorios/urls.py` (add route)
- Test: `backend/app/supletorios/tests.py` (append)

**Interfaces:**
- Consumes: `NotificacionService.crear()` (Task 4), `dias_habiles_entre()` (Task 1)
- Produces: `PATCH /api/supletorios/pendientes/{id}/agendar/`

- [ ] **Step 1: Write failing tests**

```python
# backend/app/supletorios/tests.py — append
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from app.usuarios.models import Rol
from app.usuarios.notification_service import NotificacionService
from .models import Supletorio, EstadoSupletorio

User = get_user_model()


class AgendarExamenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_prof = Rol.objects.create(nombre='profesor')
        self.profesor = User.objects.create_user(
            username='prof@test.com', email='prof@test.com',
            password='test1234', documento='333', estado='aprobado',
            rol=self.rol_prof
        )
        self.supletorio = Supletorio.objects.create(
            usuario=self.profesor,
            estudiante_nombre='Juan',
            estudiante_email='juan@test.com',
            fecha_parcial=date(2025, 6, 1),
            profesor='Profesor Test',
            asignatura='Matemáticas',
            grupo='A',
            descripcion='Test',
            estado=EstadoSupletorio.NOTIFICADO_PROFESOR,
        )
        self.client.force_authenticate(user=self.profesor)

    def test_agendar_exito(self):
        fecha = date.today() + timedelta(days=3)
        while not es_dia_habil(fecha):
            fecha += timedelta(days=1)
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/agendar/',
            {'fecha_examen_supletorio': fecha.isoformat()},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.supletorio.refresh_from_db()
        self.assertEqual(str(self.supletorio.fecha_examen_supletorio), fecha.isoformat())
        self.assertEqual(self.supletorio.estado, EstadoSupletorio.AGENDADO)

    def test_agendar_estado_invalido(self):
        self.supletorio.estado = EstadoSupletorio.PENDIENTE
        self.supletorio.save()
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/agendar/',
            {'fecha_examen_supletorio': date.today().isoformat()},
            format='json'
        )
        self.assertEqual(response.status_code, 400)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && python manage.py test app.supletorios.tests.AgendarExamenViewTest -v2`
Expected: 404 (route doesn't exist)

- [ ] **Step 3: Add AGENDADO to EstadoSupletorio choices**

```python
# backend/app/supletorios/models.py — add to EstadoSupletorio (line ~17)
    AGENDADO = 'agendado', 'Agendado'
```

- [ ] **Step 4: Add AgendarExamenSerializer**

```python
# backend/app/supletorios/serializers.py — append
from datetime import date
from app.usuarios.notification_service import NotificacionService
from app.usuarios.models import Usuario
from .business_days import dias_habiles_entre


class AgendarExamenSerializer(serializers.Serializer):
    fecha_examen_supletorio = serializers.DateField()

    def validate_fecha_examen_supletorio(self, value):
        if value < date.today():
            raise serializers.ValidationError("La fecha no puede ser en el pasado.")
        return value

    def validate(self, attrs):
        supletorio = self.context['supletorio']
        if supletorio.estado != EstadoSupletorio.NOTIFICADO_PROFESOR:
            raise serializers.ValidationError("Solo se pueden agendar supletorios notificados al profesor.")
        # Validate within 10 business days
        # Use the approval date (when estado changed to NOTIFICADO_PROFESOR)
        # For simplicity, use actualizado_en date
        desde = supletorio.actualizado_en.date()
        hasta = attrs['fecha_examen_supletorio']
        dias = dias_habiles_entre(desde, hasta)
        if dias > 10:
            raise serializers.ValidationError(
                f"La fecha excede los 10 días hábiles permitidos ({dias} días desde la confirmación)."
            )
        return attrs
```

- [ ] **Step 5: Add AgendarExamenView**

```python
# backend/app/supletorios/views.py — append
from django.utils import timezone
from app.usuarios.notification_service import NotificacionService
from app.usuarios.models import Usuario
from .serializers import AgendarExamenSerializer


class AgendarExamenView(APIView):
    def patch(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        serializer = AgendarExamenSerializer(
            data=request.data,
            context={'supletorio': supletorio}
        )
        serializer.is_valid(raise_exception=True)

        supletorio.fecha_examen_supletorio = serializer.validated_data['fecha_examen_supletorio']
        supletorio.fecha_programacion = timezone.now()
        supletorio.programado_por = request.user
        supletorio.estado = EstadoSupletorio.AGENDADO
        supletorio.save()

        # Notify student and admin
        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Examen supletorio agendado',
                mensaje=f'El examen de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue agendado para el {supletorio.fecha_examen_supletorio}.',
                tipo='examen_agendado',
                supletorio=supletorio,
            )

        estudiante = supletorio.usuario
        NotificacionService.crear(
            usuario=estudiante,
            titulo='Tu examen supletorio fue agendado',
            mensaje=f'Tu examen de {supletorio.asignatura} fue programado para el {supletorio.fecha_examen_supletorio}.',
            tipo='examen_agendado',
            supletorio=supletorio,
        )

        return Response({'detail': 'Examen agendado correctamente'})
```

- [ ] **Step 6: Add URL route**

```python
# backend/app/supletorios/urls.py — add import and route
from .views import (
    # ... existing ...
    AgendarExamenView,
)

urlpatterns = [
    # ... existing ...
    path('pendientes/<int:pk>/agendar/', AgendarExamenView.as_view()),
]
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd backend && python manage.py test app.supletorios.tests.AgendarExamenViewTest -v2`
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add backend/app/supletorios/
git commit -m "feat(backend): add schedule exam endpoint with business-day validation"
```

---

### Task 7: Grade Exam Endpoint

**Files:**
- Modify: `backend/app/supletorios/serializers.py` (add `CalificarExamenSerializer`)
- Modify: `backend/app/supletorios/views.py` (add `CalificarExamenView`)
- Modify: `backend/app/supletorios/urls.py` (add route)
- Test: `backend/app/supletorios/tests.py` (append)

**Interfaces:**
- Consumes: `NotificacionService.crear()` (Task 4)
- Produces: `PATCH /api/supletorios/pendientes/{id}/calificar/`

- [ ] **Step 1: Write failing tests**

```python
# backend/app/supletorios/tests.py — append
class CalificarExamenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_prof = Rol.objects.get(nombre='profesor') or Rol.objects.create(nombre='profesor')
        self.profesor = User.objects.create_user(
            username='prof2@test.com', email='prof2@test.com',
            password='test1234', documento='444', estado='aprobado',
            rol=self.rol_prof
        )
        self.supletorio = Supletorio.objects.create(
            usuario=self.profesor,
            estudiante_nombre='Maria',
            estudiante_email='maria@test.com',
            fecha_parcial=date(2025, 6, 1),
            profesor='Profesor Test',
            asignatura='Física',
            grupo='B',
            descripcion='Test',
            estado=EstadoSupletorio.NOTIFICADO_PROFESOR,
        )
        self.client.force_authenticate(user=self.profesor)

    def test_calificar_exito(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': 85, 'nota_observaciones': 'Buen desempeño'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.supletorio.refresh_from_db()
        self.assertEqual(self.supletorio.nota, 85)
        self.assertEqual(self.supletorio.estado, EstadoSupletorio.REALIZADO)

    def test_calificar_nota_fuera_rango(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': 150},
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_calificar_nota_negativa(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': -5},
            format='json'
        )
        self.assertEqual(response.status_code, 400)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && python manage.py test app.supletorios.tests.CalificarExamenViewTest -v2`
Expected: 404

- [ ] **Step 3: Add CalificarExamenSerializer**

```python
# backend/app/supletorios/serializers.py — append
class CalificarExamenSerializer(serializers.Serializer):
    nota = serializers.IntegerField(min_value=0, max_value=100)
    nota_observaciones = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, attrs):
        supletorio = self.context['supletorio']
        if supletorio.estado not in (EstadoSupletorio.NOTIFICADO_PROFESOR, EstadoSupletorio.AGENDADO):
            raise serializers.ValidationError("Solo se pueden calificar supletorios notificados o agendados.")
        return attrs
```

- [ ] **Step 4: Add CalificarExamenView**

```python
# backend/app/supletorios/views.py — append
class CalificarExamenView(APIView):
    def patch(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        serializer = CalificarExamenSerializer(
            data=request.data,
            context={'supletorio': supletorio}
        )
        serializer.is_valid(raise_exception=True)

        supletorio.nota = serializer.validated_data['nota']
        supletorio.nota_observaciones = serializer.validated_data.get('nota_observaciones', '')
        supletorio.estado = EstadoSupletorio.REALIZADO
        supletorio.save()

        # Notify student and admin
        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Supletorio calificado',
                mensaje=f'El supletorio de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue calificado con nota {supletorio.nota}.',
                tipo='examen_calificado',
                supletorio=supletorio,
            )

        estudiante = supletorio.usuario
        NotificacionService.crear(
            usuario=estudiante,
            titulo='Tu supletorio fue calificado',
            mensaje=f'Tu supletorio de {supletorio.asignatura} fue calificado. Nota: {supletorio.nota}.',
            tipo='examen_calificado',
            supletorio=supletorio,
        )

        return Response({'detail': 'Supletorio calificado correctamente'})
```

- [ ] **Step 5: Add URL route**

```python
# backend/app/supletorios/urls.py — add import and route
from .views import (
    # ... existing ...
    CalificarExamenView,
)

urlpatterns = [
    # ... existing ...
    path('pendientes/<int:pk>/calificar/', CalificarExamenView.as_view()),
]
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd backend && python manage.py test app.supletorios.tests.CalificarExamenViewTest -v2`
Expected: All 3 tests PASS

- [ ] **Step 7: Commit**

```bash
git add backend/app/supletorios/
git commit -m "feat(backend): add grade exam endpoint with notification triggers"
```

---

### Task 8: Wire Notifications into Existing Views

**Files:**
- Modify: `backend/app/supletorios/views.py` (add notification calls to 4 existing views)

**Interfaces:**
- Consumes: `NotificacionService.crear()` (Task 4), `Usuario` model
- Produces: Notifications created on approve/reject/confirm-pago/solicitud-create

- [ ] **Step 1: Add notifications to SolicitudSupletorioCreateView**

In `SolicitudSupletorioCreateView`, after successful creation, add notification creation. The cleanest approach is to override `perform_create`:

```python
# backend/app/supletorios/views.py — modify SolicitudSupletorioCreateView
from app.usuarios.models import Usuario
from app.usuarios.notification_service import NotificacionService


class SolicitudSupletorioCreateView(generics.CreateAPIView):
    serializer_class = SupletorioCreateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        supletorio = serializer.save()
        # Notify admins
        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Nueva solicitud de supletorio',
                mensaje=f'{supletorio.estudiante_nombre} solicitó un supletorio de {supletorio.asignatura}.',
                tipo='solicitud_creada',
                supletorio=supletorio,
            )
```

- [ ] **Step 2: Add notifications to AprobarSupletorioView**

```python
# backend/app/supletorios/views.py — modify AprobarSupletorioView
class AprobarSupletorioView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.FORMATO_PENDIENTE
        supletorio.save()

        # Notify student
        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Solicitud aprobada',
            mensaje=f'Tu solicitud de supletorio de {supletorio.asignatura} fue aprobada. Ya puedes llenar el formato y realizar el pago.',
            tipo='solicitud_aprobada',
            supletorio=supletorio,
        )

        enviar_correo(
            supletorio.estudiante_email,
            'Solicitud de supletorio aprobada',
            'Tu solicitud fue aprobada. Ya puedes llenar el formato y realizar el pago.',
        )
        return Response(SupletorioBandejaSerializer(supletorio).data)
```

- [ ] **Step 3: Add notifications to RechazarSupletorioView**

```python
# backend/app/supletorios/views.py — modify RechazarSupletorioView
class RechazarSupletorioView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.RECHAZADA
        supletorio.save()

        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Solicitud rechazada',
            mensaje=f'Tu solicitud de supletorio de {supletorio.asignatura} fue rechazada.',
            tipo='solicitud_rechazada',
            supletorio=supletorio,
        )

        return Response(SupletorioBandejaSerializer(supletorio).data)
```

- [ ] **Step 4: Add notifications to ConfirmarPagoView**

```python
# backend/app/supletorios/views.py — modify ConfirmarPagoView
class ConfirmarPagoView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.NOTIFICADO_PROFESOR
        supletorio.save()

        # Notify student
        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Pago confirmado',
            mensaje=f'El pago de tu supletorio de {supletorio.asignatura} fue confirmado. El profesor será notificado.',
            tipo='pago_confirmado',
            supletorio=supletorio,
        )

        # Notify professor
        # Find professor by email (profesor is a CharField, not FK)
        from app.usuarios.models import Usuario as U
        prof_user = U.objects.filter(email__icontains=supletorio.profesor.lower().split()[0] if supletorio.profesor else '').first()
        if prof_user:
            NotificacionService.crear(
                usuario=prof_user,
                titulo='Supletorio pendiente',
                mensaje=f'Tienes un supletorio de {supletorio.asignatura} para {supletorio.estudiante_nombre}.',
                tipo='pago_confirmado',
                supletorio=supletorio,
            )

        return Response(SupletorioBandejaSerializer(supletorio).data)
```

Note: The professor lookup is approximate since `profesor` is a CharField. This is a known limitation — when Phase 2 Task 7 (ProfesorAsignatura FK) is implemented, this can be refined.

- [ ] **Step 5: Run all backend tests**

Run: `cd backend && python manage.py test app.supletorios.tests app.usuarios.tests -v2`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/supletorios/views.py
git commit -m "feat(backend): wire notifications into existing supletorio workflow views"
```

---

### Task 9: Frontend — Business Days Utility

**Files:**
- Create: `frontend/src/app/core/utils/business-days.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `esDiaHabil()`, `diasHabilesEntre()`, `agregarDiasHabiles()`

- [ ] **Step 1: Create business-days.ts**

```typescript
// frontend/src/app/core/utils/business-days.ts

const COLOMBIAN_HOLIDAYS: Set<string> = new Set([
  // 2025
  '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18',
  '2025-05-01', '2025-05-26', '2025-06-16', '2025-06-23', '2025-06-29',
  '2025-07-20', '2025-08-07', '2025-08-18', '2025-10-13', '2025-11-03',
  '2025-11-17', '2025-12-08', '2025-12-25',
  // 2026
  '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
  '2026-05-01', '2026-06-08', '2026-06-29', '2026-07-06', '2026-07-20',
  '2026-08-07', '2026-08-24', '2026-10-12', '2026-11-02', '2026-11-16',
  '2026-12-08', '2026-12-25',
]);

function toKey(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function esDiaHabil(fecha: Date): boolean {
  return fecha.getDay() < 5 && !COLOMBIAN_HOLIDAYS.has(toKey(fecha));
}

export function diasHabilesEntre(inicio: Date, fin: Date): number {
  let count = 0;
  const actual = new Date(inicio);
  while (actual < fin) {
    if (esDiaHabil(actual)) count++;
    actual.setDate(actual.getDate() + 1);
  }
  return count;
}

export function agregarDiasHabiles(fecha: Date, n: number): Date {
  const resultado = new Date(fecha);
  let agregados = 0;
  while (agregados < n) {
    resultado.setDate(resultado.getDate() + 1);
    if (esDiaHabil(resultado)) agregados++;
  }
  return resultado;
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors (budget warning is OK)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/core/utils/business-days.ts
git commit -m "feat(frontend): add business days utility with Colombian holidays"
```

---

### Task 10: Frontend — Model Updates

**Files:**
- Modify: `frontend/src/app/models/supletorio.model.ts`
- Create: `frontend/src/app/models/notificacion.model.ts`

**Interfaces:**
- Consumes: nothing
- Produces: Updated `SolicitudSupletorio`, `MiSolicitudSupletorio`, new `Notificacion`

- [ ] **Step 1: Update supletorio.model.ts**

Add to `SolicitudSupletorio`:
```typescript
  fechaExamen?: string;
  nota?: number;
```

Add to `MiSolicitudSupletorio`:
```typescript
  fechaExamen?: string;
  nota?: number;
```

- [ ] **Step 2: Create notificacion.model.ts**

```typescript
// frontend/src/app/models/notificacion.model.ts

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'solicitud_creada' | 'solicitud_aprobada' | 'solicitud_rechazada'
    | 'pago_confirmado' | 'examen_agendado' | 'examen_calificado';
  leido: boolean;
  supletorio_id?: string;
  creado_en: string;
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/models/
git commit -m "feat(frontend): update Supletorio model, add Notificacion model"
```

---

### Task 11: Frontend — Notification Service

**Files:**
- Create: `frontend/src/app/core/services/notification.service.ts`

**Interfaces:**
- Consumes: `Notificacion` model (Task 10), `HttpClient`, `environment.apiUrl`
- Produces: `NotificationService` with signals

- [ ] **Step 1: Create notification.service.ts**

```typescript
// frontend/src/app/core/services/notification.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/usuarios/notificaciones`;

  private _notificaciones = signal<Notificacion[]>([]);
  private _noLeidas = signal<number>(0);

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly noLeidas = this._noLeidas.asReadonly();
  readonly tieneNoLeidas = computed(() => this._noLeidas() > 0);

  cargarNotificaciones(): void {
    this.http.get<{ results: Notificacion[] }>(`${this.api}/`)
      .subscribe({
        next: (res) => this._notificaciones.set(res.results),
        error: () => this._notificaciones.set([]),
      });
  }

  contarNoLeidas(): void {
    this.http.get<{ count: number }>(`${this.api}/contar-no-leidas/`)
      .subscribe({
        next: (res) => this._noLeidas.set(res.count),
        error: () => this._noLeidas.set(0),
      });
  }

  marcarLeida(id: string): void {
    this.http.patch(`${this.api}/${id}/leer/`, {})
      .subscribe({
        next: () => {
          this._notificaciones.update(n =>
            n.map(notif => notif.id === id ? { ...notif, leido: true } : notif)
          );
          this._noLeidas.update(c => Math.max(0, c - 1));
        },
      });
  }

  marcarTodasLeidas(): void {
    this.http.post(`${this.api}/leer-todas/`, {})
      .subscribe({
        next: () => {
          this._notificaciones.update(n =>
            n.map(notif => ({ ...notif, leido: true }))
          );
          this._noLeidas.set(0);
        },
      });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/core/services/notification.service.ts
git commit -m "feat(frontend): add NotificationService with signals"
```

---

### Task 12: Frontend — Notification Bell Component

**Files:**
- Create: `frontend/src/app/shared/components/notification-bell/notification-bell.component.ts`

**Interfaces:**
- Consumes: `NotificationService` (Task 11), `Router`
- Produces: `<app-notification-bell>` standalone component

- [ ] **Step 1: Create notification-bell.component.ts**

```typescript
// frontend/src/app/shared/components/notification-bell/notification-bell.component.ts
import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  template: `
    <div class="notif-wrapper">
      <button class="notif-bell" (click)="togglePanel()" aria-label="Notificaciones">
        <span class="bell-icon">&#128276;</span>
        @if (notifService.tieneNoLeidas()) {
          <span class="notif-badge">{{ notifService.noLeidas() }}</span>
        }
      </button>

      @if (panelAbierto()) {
        <div class="notif-panel">
          <div class="notif-header">
            <span>Notificaciones</span>
            @if (notifService.noLeidas() > 0) {
              <button class="notif-mark-all" (click)="marcarTodasLeidas()">
                Marcar todas como leídas
              </button>
            }
          </div>
          <div class="notif-list">
            @for (n of notifService.notificaciones(); track n.id) {
              <div class="notif-item" [class.no-leida]="!n.leido"
                   (click)="onNotificacionClick(n)">
                <div class="notif-tipo">{{ iconoTipo(n.tipo) }}</div>
                <div class="notif-body">
                  <div class="notif-titulo">{{ n.titulo }}</div>
                  <div class="notif-mensaje">{{ n.mensaje }}</div>
                  <div class="notif-tiempo">{{ tiempoRelativo(n.creado_en) }}</div>
                </div>
              </div>
            } @empty {
              <div class="notif-empty">No hay notificaciones</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-wrapper { position: relative; }
    .notif-bell {
      background: none; border: none; cursor: pointer;
      font-size: 1.3rem; position: relative; padding: 4px 8px;
      color: var(--color-text, #333);
    }
    .notif-badge {
      position: absolute; top: 0; right: 0;
      background: #e74c3c; color: white; border-radius: 50%;
      font-size: 0.65rem; font-weight: 700;
      min-width: 16px; height: 16px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }
    .notif-panel {
      position: absolute; top: 100%; right: 0;
      width: 360px; max-height: 420px;
      background: white; border: 1px solid #ddd;
      border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 1000; overflow: hidden;
    }
    .notif-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid #eee;
      font-weight: 600; font-size: 0.9rem;
    }
    .notif-mark-all {
      background: none; border: none; color: var(--color-accent, #3da5d9);
      cursor: pointer; font-size: 0.75rem;
    }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 10px; padding: 10px 16px;
      cursor: pointer; transition: background 0.15s;
      border-bottom: 1px solid #f5f5f5;
    }
    .notif-item:hover { background: #f9f9f9; }
    .notif-item.no-leida { background: #f0f7ff; }
    .notif-tipo { font-size: 1.2rem; flex-shrink: 0; padding-top: 2px; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-titulo { font-weight: 600; font-size: 0.8rem; margin-bottom: 2px; }
    .notif-mensaje { font-size: 0.75rem; color: #666; line-height: 1.3; }
    .notif-tiempo { font-size: 0.65rem; color: #999; margin-top: 3px; }
    .notif-empty { padding: 24px; text-align: center; color: #999; font-size: 0.85rem; }
  `],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifService = inject(NotificationService);
  private router = inject(Router);
  panelAbierto = signal(false);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.notifService.contarNoLeidas();
    this.refreshInterval = setInterval(() => {
      this.notifService.contarNoLeidas();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.panelAbierto.set(false);
    }
  }

  togglePanel(): void {
    const next = !this.panelAbierto();
    this.panelAbierto.set(next);
    if (next) {
      this.notifService.cargarNotificaciones();
    }
  }

  onNotificacionClick(notif: import('../../../models/notificacion.model').Notificacion): void {
    if (!notif.leido) {
      this.notifService.marcarLeida(notif.id);
    }
    if (notif.supletorio_id) {
      this.panelAbierto.set(false);
      // Navigate to relevant page based on role
      this.router.navigate(['/admin/bandeja-supletorios']);
    }
  }

  marcarTodasLeidas(): void {
    this.notifService.marcarTodasLeidas();
  }

  iconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      solicitud_creada: '\u{1F4DD}',
      solicitud_aprobada: '\u{2705}',
      solicitud_rechazada: '\u{274C}',
      pago_confirmado: '\u{1F4B3}',
      examen_agendado: '\u{1F4C5}',
      examen_calificado: '\u{1F4DD}',
    };
    return iconos[tipo] || '\u{1F514}';
  }

  tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/shared/components/notification-bell/
git commit -m "feat(frontend): add NotificationBellComponent with dropdown panel"
```

---

### Task 13: Frontend — Integrate Bell into Navbar

**Files:**
- Modify: `frontend/src/app/app.component.html` (add bell)
- Modify: `frontend/src/app/app.component.ts` (inject NotificationService)

**Interfaces:**
- Consumes: `NotificationBellComponent` (Task 12), `NotificationService` (Task 11)
- Produces: Bell visible in navbar for authenticated users

- [ ] **Step 1: Add bell to navbar**

```html
<!-- frontend/src/app/app.component.html — add before the role/logout section -->
@if (authService.usuarioActual()) {
  <app-notification-bell />
}
```

Place it right before the `@if (authService.usuarioActual()?.rol)` block (around line 27).

- [ ] **Step 2: Import NotificationBellComponent in app.component.ts**

```typescript
// frontend/src/app/app.component.ts — add import
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NotificationBellComponent],
  // ... rest unchanged
})
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/app.component.html frontend/src/app/app.component.ts
git commit -m "feat(frontend): integrate notification bell into navbar"
```

---

### Task 14: Frontend — Professor Panel API Integration

**Files:**
- Modify: `frontend/src/app/features/profesor/supletorios-pendientes/supletorios-pendientes.component.ts`
- Modify: `frontend/src/app/models/supletorio.model.ts` (add `SupletorioPendiente` interface)

**Interfaces:**
- Consumes: `HttpClient`, `environment.apiUrl`, `ConfirmDialogComponent`, `ModalComponent`, `business-days.ts`
- Produces: Fully connected professor panel with schedule/grade modals

- [ ] **Step 1: Add SupletorioPendiente interface**

```typescript
// frontend/src/app/models/supletorio.model.ts — append
export interface SupletorioPendiente {
  id: string;
  estudiante: string;
  programa: string;
  asignatura: string;
  grupo: string;
  fechaParcial: string;
  estado: 'listo' | 'realizado' | 'agendado';
  fechaExamen?: string;
  nota?: number;
}
```

- [ ] **Step 2: Rewrite supletorios-pendientes.component.ts**

Replace the entire file with API-connected version:

```typescript
// frontend/src/app/features/profesor/supletorios-pendientes/supletorios-pendientes.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SupletorioPendiente } from '../../../models/supletorio.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { esDiaHabil, diasHabilesEntre } from '../../../core/utils/business-days';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supletorios-pendientes',
  standalone: true,
  imports: [ConfirmDialogComponent, ModalComponent, FormsModule],
  template: `
    <section class="page">
      <h1>Supletorios Pendientes</h1>

      @if (loading()) {
        <p>Cargando...</p>
      } @else if (supletorios().length === 0) {
        <p class="empty">No hay supletorios pendientes.</p>
      } @else {
        <div class="cards">
          @for (s of supletorios(); track s.id) {
            <div class="card" [class.realizado]="s.estado === 'realizado'">
              <div class="card-header">
                <span class="asignatura">{{ s.asignatura }}</span>
                <span class="badge" [class]="'badge-' + s.estado">{{ s.estado }}</span>
              </div>
              <div class="card-body">
                <p><strong>Estudiante:</strong> {{ s.estudiante }}</p>
                <p><strong>Programa:</strong> {{ s.programa }}</p>
                <p><strong>Grupo:</strong> {{ s.grupo }}</p>
                <p><strong>Fecha parcial:</strong> {{ s.fechaParcial }}</p>
                @if (s.fechaExamen) {
                  <p><strong>Fecha examen:</strong> {{ s.fechaExamen }}</p>
                }
                @if (s.nota !== undefined && s.nota !== null) {
                  <p><strong>Nota:</strong> {{ s.nota }}/100</p>
                }
              </div>
              @if (s.estado === 'listo') {
                <div class="card-actions">
                  <button class="btn btn-primary" (click)="abrirModalAgendar(s)">Agendar Examen</button>
                  <button class="btn btn-secondary" (click)="abrirModalCalificar(s)">Calificar</button>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (modalAgendarAbierto()) {
        <app-modal titulo="Agendar Examen Supletorio" (cerrar)="cerrarModalAgendar()">
          <div class="form-group">
            <label>Fecha del examen</label>
            <input type="date" [(ngModel)]="fechaAgendar" [min]="minFechaAgendar()" />
            @if (errorAgendar()) {
              <p class="error">{{ errorAgendar() }}</p>
            }
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModalAgendar()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarAgendar()" [disabled]="!fechaAgendar">Agendar</button>
          </div>
        </app-modal>
      }

      @if (modalCalificarAbierto()) {
        <app-modal titulo="Calificar Supletorio" (cerrar)="cerrarModalCalificar()">
          <div class="form-group">
            <label>Nota (0-100)</label>
            <input type="number" [(ngModel)]="notaCalificar" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Observaciones (opcional)</label>
            <textarea [(ngModel)]="observacionesCalificar" rows="3"></textarea>
          </div>
          @if (errorCalificar()) {
            <p class="error">{{ errorCalificar() }}</p>
          }
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModalCalificar()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarCalificar()" [disabled]="notaCalificar === null">Calificar</button>
          </div>
        </app-modal>
      }

      @if (confirmarAccion()) {
        <app-confirm-dialog
          [titulo]="confirmarAccion()!.titulo"
          [mensaje]="confirmarAccion()!.mensaje"
          confirmarLabel="Confirmar"
          (confirmar)="ejecutarAccionConfirmada()"
          (cancelar)="confirmarAccion.set(null)"
        />
      }
    </section>
  `,
  styles: [`
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    h1 { color: var(--color-primary, #0a2463); margin-bottom: 20px; }
    .cards { display: grid; gap: 16px; }
    .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .card.realizado { opacity: 0.7; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .asignatura { font-weight: 700; color: var(--color-primary, #0a2463); }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge-listo { background: #fff3cd; color: #856404; }
    .badge-realizado { background: #d4edda; color: #155724; }
    .badge-agendado { background: #cce5ff; color: #004085; }
    .card-body p { margin: 4px 0; font-size: 0.85rem; }
    .card-actions { margin-top: 12px; display: flex; gap: 8px; }
    .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .btn-primary { background: var(--color-primary, #0a2463); color: white; }
    .btn-secondary { background: #e0e0e0; color: #333; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.85rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;
    }
    .error { color: #e74c3c; font-size: 0.8rem; margin-top: 4px; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .empty { color: #999; text-align: center; padding: 40px; }
  `],
})
export class SupletoriosPendientesComponent implements OnInit {
  private http = inject(HttpClient);
  private feedback = inject(FeedbackService);
  private api = `${environment.apiUrl}/supletorios/pendientes`;

  supletorios = signal<SupletorioPendiente[]>([]);
  loading = signal(true);

  // Schedule modal
  modalAgendarAbierto = signal(false);
  supletorioSeleccionado = signal<SupletorioPendiente | null>(null);
  fechaAgendar = '';
  errorAgendar = signal('');
  minFechaAgendar = signal('');

  // Grade modal
  modalCalificarAbierto = signal(false);
  notaCalificar: number | null = null;
  observacionesCalificar = '';
  errorCalificar = signal('');

  // Confirm dialog
  confirmarAccion = signal<{ titulo: string; mensaje: string; accion: () => void } | null>(null);

  ngOnInit(): void {
    this.cargarSupletorios();
    const hoy = new Date();
    this.minFechaAgendar.set(hoy.toISOString().split('T')[0]);
  }

  cargarSupletorios(): void {
    this.loading.set(true);
    this.http.get<SupletorioPendiente[]>(`${this.api}/`)
      .subscribe({
        next: (data) => { this.supletorios.set(data); this.loading.set(false); },
        error: () => { this.loading.set(false); this.feedback.mostrar('Error al cargar supletorios'); },
      });
  }

  abrirModalAgendar(s: SupletorioPendiente): void {
    this.supletorioSeleccionado.set(s);
    this.fechaAgendar = '';
    this.errorAgendar.set('');
    this.modalAgendarAbierto.set(true);
  }

  cerrarModalAgendar(): void {
    this.modalAgendarAbierto.set(false);
    this.supletorioSeleccionado.set(null);
  }

  confirmarAgendar(): void {
    const s = this.supletorioSeleccionado();
    if (!s || !this.fechaAgendar) return;

    const fecha = new Date(this.fechaAgendar);
    const hoy = new Date();
    const dias = diasHabilesEntre(hoy, fecha);
    if (dias > 10) {
      this.errorAgendar.set(`La fecha excede los 10 días hábiles permitidos (${dias} días).`);
      return;
    }

    this.confirmarAccion.set({
      titulo: 'Agendar Examen',
      mensaje: `¿Agendar examen para ${s.estudiante} (${s.asignatura}) el ${this.fechaAgendar}?`,
      accion: () => {
        this.http.patch(`${this.api}/${s.id}/agendar/`, {
          fecha_examen_supletorio: this.fechaAgendar,
        }).subscribe({
          next: () => {
            this.feedback.mostrar('Examen agendado correctamente');
            this.cerrarModalAgendar();
            this.cargarSupletorios();
          },
          error: (err) => {
            this.errorAgendar.set(err.error?.detail || 'Error al agendar');
          },
        });
      },
    });
  }

  abrirModalCalificar(s: SupletorioPendiente): void {
    this.supletorioSeleccionado.set(s);
    this.notaCalificar = null;
    this.observacionesCalificar = '';
    this.errorCalificar.set('');
    this.modalCalificarAbierto.set(true);
  }

  cerrarModalCalificar(): void {
    this.modalCalificarAbierto.set(false);
    this.supletorioSeleccionado.set(null);
  }

  confirmarCalificar(): void {
    const s = this.supletorioSeleccionado();
    if (!s || this.notaCalificar === null) return;

    this.confirmarAccion.set({
      titulo: 'Calificar Supletorio',
      mensaje: `¿Calificar a ${s.estudiante} (${s.asignatura}) con nota ${this.notaCalificar}?`,
      accion: () => {
        this.http.patch(`${this.api}/${s.id}/calificar/`, {
          nota: this.notaCalificar,
          nota_observaciones: this.observacionesCalificar,
        }).subscribe({
          next: () => {
            this.feedback.mostrar('Supletorio calificado correctamente');
            this.cerrarModalCalificar();
            this.cargarSupletorios();
          },
          error: (err) => {
            this.errorCalificar.set(err.error?.detail || 'Error al calificar');
          },
        });
      },
    });
  }

  ejecutarAccionConfirmada(): void {
    const accion = this.confirmarAccion()?.accion;
    this.confirmarAccion.set(null);
    accion?.();
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/profesor/supletorios-pendientes/ frontend/src/app/models/supletorio.model.ts
git commit -m "feat(frontend): connect professor panel to API with schedule/grade modals"
```

---

### Task 15: Frontend — Student Mis Supletorios Updates

**Files:**
- Modify: `frontend/src/app/features/estudiante/pago-supletorio/pago-supletorio.component.ts`

**Interfaces:**
- Consumes: `MiSolicitudSupletorio` model (updated in Task 10)
- Produces: Shows `fechaExamen` and `nota` columns when available

- [ ] **Step 1: Add fecha examen and nota to the student supletorio table**

In the template, add two new columns after the existing ones:

```html
<!-- Add after the "Fecha Parcial" column header and cell -->
<th>Fecha Examen</th>
<!-- In the row -->
<td>{{ s.fechaExamen || '—' }}</td>

<th>Nota</th>
<td>{{ s.nota ?? '—' }}</td>
```

Also update the `MiSolicitudSupletorio` references to include these fields.

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/estudiante/pago-supletorio/
git commit -m "feat(frontend): add exam date and grade columns to student supletorio view"
```

---

### Task 16: Frontend — Admin Bandeja Updates

**Files:**
- Modify: `frontend/src/app/features/admin/bandeja-supletorios/bandeja-supletorios.component.ts`

**Interfaces:**
- Consumes: `SolicitudSupletorio` model (updated in Task 10)
- Produces: Shows `fechaExamen` and `nota` columns in admin table

- [ ] **Step 1: Add columns to admin table**

In the template, add two new `<th>` headers and `<td>` cells:

```html
<!-- Add headers -->
<th>Fecha Examen</th>
<th>Nota</th>

<!-- Add cells in the row -->
<td>{{ s.fechaExamen || '—' }}</td>
<td>{{ s.nota ?? '—' }}</td>
```

Also update `SupletorioBandejaSerializer` in backend to include these fields:

```python
# backend/app/supletorios/serializers.py — add to SupletorioBandejaSerializer
    fechaExamen = serializers.DateField(source='fecha_examen_supletorio', default=None)
    nota = serializers.IntegerField(default=None)

    class Meta:
        model = Supletorio
        fields = ['id', 'estudiante', 'email', 'programa', 'asignatura', 'profesor', 'grupo',
                  'descripcion', 'fechaParcial', 'estadoSolicitud', 'estadoPago', 'comprobanteNombre',
                  'fechaExamen', 'nota']
```

- [ ] **Step 2: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/admin/bandeja-supletorios/ backend/app/supletorios/serializers.py
git commit -m "feat: add exam date and grade columns to admin bandeja view"
```

---

### Task 17: Frontend — Solicitud Form Business Day Validation

**Files:**
- Modify: `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.ts`

**Interfaces:**
- Consumes: `diasHabilesEntre()` from `business-days.ts` (Task 9)
- Produces: Refined `excedeLimite` signal using real business day calculation

- [ ] **Step 1: Update excedeLimite to use business days**

Replace the existing `excedeLimite` computed signal:

```typescript
// Replace the existing excedeLimite computation
import { diasHabilesEntre } from '../../../core/utils/business-days';

// In the component class, replace the existing excedeLimite signal:
readonly excedeLimite = computed(() => {
  const fp = this.solicitudForm.get('fechaParcial')?.value;
  if (!fp) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaParcial = new Date(fp);
  const diff = diasHabilesEntre(fechaParcial, hoy);
  return diff > Supletorio.DIAS_LIMITE;
});

readonly diasDesdeParcial = computed(() => {
  const fp = this.solicitudForm.get('fechaParcial')?.value;
  if (!fp) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaParcial = new Date(fp);
  return diasHabilesEntre(fechaParcial, hoy);
});
```

- [ ] **Step 2: Update the warning message to show exact days**

```html
@if (excedeLimite()) {
  <div class="advertencia">
    <p><strong>Advertencia:</strong> La fecha del parcial tiene {{ diasDesdeParcial() }} días hábiles de diferencia (límite: {{ Supletorio.DIAS_LIMITE }}). La solicitud será revisada por el administrador.</p>
  </div>
}
```

- [ ] **Step 3: Verify build**

Run: `cd frontend && npx ng build --configuration=production 2>&1 | Select-String -Pattern "error|Error|WARNING"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/estudiante/solicitud-supletorio/
git commit -m "feat(frontend): refine business-day validation in solicitud form"
```

---

### Task 18: End-to-End Verification

**Files:** None (verification only)

- [ ] **Step 1: Run all backend tests**

Run: `cd backend && python manage.py test app -v2`
Expected: All tests PASS

- [ ] **Step 2: Verify clean frontend build**

Run: `cd frontend && npx ng build --configuration=production`
Expected: Build succeeds, no errors (budget warning OK)

- [ ] **Step 3: Verify all routes load**

Run: `cd frontend && npx ng serve`
Then manually verify these routes load without errors:
- `/login` — login page
- `/dashboard` — dashboard
- `/admin/bandeja-supletorios` — admin view with new columns
- `/profesor/supletorios-pendientes` — professor view with API data
- `/estudiante/mis-solicitudes` — student view with new columns
- `/estudiante/solicitud-supletorio` — form with business day validation

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: end-to-end verification fixes for Phase 3"
```
