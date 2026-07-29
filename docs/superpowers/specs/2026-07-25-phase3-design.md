# Phase 3 — Holiday Logic, Notification Center & Grading Evidence

**Date:** 2026-07-25
**Status:** Draft
**Project:** pisunpa-project

---

## 1. Overview

Phase 3 adds three features to the pisunpa system:

1. **Business-day logic** — Colombian holidays hardcoded, scheduling validation (5-day student, 10-day professor windows)
2. **Notification center** — DB-persisted notifications with bell indicator in navbar
3. **Exam scheduling & grading** — Professor schedules exam date, records grade (0-100) + observations

---

## 2. Backend Changes

### 2.1 Business Days Service (`app/supletorios/business_days.py`)

New utility module with:

```python
# Hardcoded Colombian holidays 2024-2026
COLOMBIAN_HOLIDAYS = {
    date(2024, 1, 1),   # Año Nuevo
    date(2024, 1, 8),   # Día de los Reyes Magos
    date(2024, 3, 25),  # Semana Santa (Lunes)
    date(2024, 3, 28),  # Jueves Santo
    date(2024, 3, 29),  # Viernes Santo
    date(2024, 5, 1),   # Día del Trabajo
    date(2024, 5, 13),  # Ascensión del Señor
    date(2024, 6, 3),   # Corpus Christi
    date(2024, 6, 10),  # Sagrado Corazón
    date(2024, 6, 29),  # San Pedro y San Pablo
    date(2024, 7, 20),  # Día de la Independencia
    date(2024, 8, 7),   # Batalla de Boyacá
    date(2024, 8, 15),  # Asunción de la Virgen
    date(2024, 10, 14), # Día de la Raza
    date(2024, 11, 1),  # Todos los Santos
    date(2024, 11, 11), # Independencia de Cartagena
    date(2024, 12, 8),  # Inmaculada Concepción
    date(2024, 12, 25), # Navidad
    # 2025 and 2026 holidays...
}

def es_dia_habil(fecha: date) -> bool:
    """Returns True if date is a weekday and not a holiday."""

def dias_habiles_entre(fecha_inicio: date, fecha_fin: date) -> int:
    """Count business days between two dates (exclusive of end)."""

def agregar_dias_habiles(fecha: date, n: int) -> date:
    """Add n business days to a date."""
```

- Excludes Saturdays (weekday=5) and Sundays (weekday=6)
- Holiday list is a set for O(1) lookup
- Easily extensible — add new years as needed

### 2.2 Supletorio Model Changes (`app/supletorios/models.py`)

Add fields to `Supletorio`:

```python
class Supletorio(models.Model):
    # ... existing fields ...
    fecha_examen_supletorio = models.DateField(null=True, blank=True)
    nota = models.IntegerField(null=True, blank=True)  # 0-100
    nota_observaciones = models.TextField(blank=True, default='')
    fecha_programacion = models.DateTimeField(null=True, blank=True)
    programado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='supletorios_programados'
    )
```

- `fecha_examen_supletorio` — the scheduled exam date
- `nota` — integer 0-100 (null until graded)
- `nota_observaciones` — professor's comments
- `fecha_programacion` — timestamp when the exam was scheduled
- `programado_por` — which user (professor) scheduled it

### 2.3 Notification Model (`app/usuarios/models.py`)

```python
class Notificacion(models.Model):
    class TipoNotificacion(models.TextChoices):
        SOLICITUD_CREADA = 'solicitud_creada', 'Solicitud Creada'
        SOLICITUD_APROBADA = 'solicitud_aprobada', 'Solicitud Aprobada'
        SOLICITUD_RECHAZADA = 'solicitud_rechazada', 'Solicitud Rechazada'
        PAGO_CONFIRMADO = 'pago_confirmado', 'Pago Confirmado'
        EXAMEN_AGENDADO = 'examen_agendado', 'Examen Agendado'
        EXAMEN_CALIFICADO = 'examen_calificado', 'Examen Calificado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
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
```

### 2.4 Notification Service (`app/usuarios/notification_service.py`)

```python
class NotificacionService:
    @staticmethod
    def crear(usuario, titulo, mensaje, tipo, supletorio=None) -> Notificacion:
        """Create and persist a notification."""

    @staticmethod
    def marcar_como_leida(notificacion_id, usuario) -> bool:
        """Mark as read. Returns True if found and updated."""

    @staticmethod
    def contar_no_leidas(usuario) -> int:
        """Count unread notifications for a user."""

    @staticmethod
    def obtener_notificaciones(usuario, solo_no_leidas=False) -> QuerySet:
        """Get notifications ordered by date."""
```

### 2.5 New Endpoints

#### Schedule Exam — `PATCH /api/supletorios/pendientes/{id}/agendar/`

- **Permission:** `IsAuthenticated`, must be the assigned professor or admin
- **Body:** `{ "fecha_examen_supletorio": "2026-08-05" }`
- **Validation:**
  - Estado must be `notificado_profesor`
  - `fecha_examen_supletorio` must be within 10 business days from approval date
  - Date must not be in the past
- **Action:** Sets `fecha_examen_supletorio`, `fecha_programacion=now()`, `programado_por=request.user`, `estado=agendado`
- **Notifications:** Creates for student and admin

#### Grade Exam — `PATCH /api/supletorios/pendientes/{id}/calificar/`

- **Permission:** `IsAuthenticated`, must be the assigned professor
- **Body:** `{ "nota": 85, "nota_observaciones": "Buen desempeño" }`
- **Validation:**
  - Estado must be `notificado_profesor` or `agendado`
  - `nota` between 0 and 100
- **Action:** Sets `nota`, `nota_observaciones`, `estado=realizado`
- **Notifications:** Creates for student and admin

#### Notification Endpoints (`app/usuarios/views.py`)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/usuarios/notificaciones/` | List (paginated, filtered by user) |
| GET | `/api/usuarios/notificaciones/contar-no-leidas/` | Return `{ "count": N }` |
| PATCH | `/api/usuarios/notificaciones/{id}/leer/` | Mark single as read |
| POST | `/api/usuarios/notificaciones/leer-todas/` | Mark all as read |

### 2.6 Notification Trigger Points

Integrate `NotificacionService.crear()` into existing views:

| View | Event | Recipients | Tipo |
|------|-------|------------|------|
| `SolicitudSupletorioCreateView` | New solicitud | admin, profesor | `solicitud_creada` |
| `AprobarSupletorioView` | Admin approves | estudiante, profesor | `solicitud_aprobada` |
| `RechazarSupletorioView` | Admin rejects | estudiante | `solicitud_rechazada` |
| `ConfirmarPagoView` | Payment confirmed | estudiante, profesor | `pago_confirmado` |
| `AgendarExamenView` (new) | Exam scheduled | estudiante, admin | `examen_agendado` |
| `CalificarExamenView` (new) | Exam graded | estudiante, admin | `examen_calificado` |

### 2.7 Updated Supletorio Flow

```
pendiente → formato_pendiente (admin aprueba solicitud)
           → comprobante_subido (estudiante sube comprobante)
           → notificado_profesor (admin confirma pago)
           → agendado (profesor asigna fecha de examen)
           → realizado (profesor califica)
```

---

## 3. Frontend Changes

### 3.1 Business Days (Angular Utility)

Create `src/app/core/utils/business-days.ts`:

```typescript
const COLOMBIAN_HOLIDAYS: Set<string> = new Set([
  '2024-01-01', '2024-01-08', '2024-03-25', '2024-03-28',
  '2024-03-29', '2024-05-01', '2024-05-13', '2024-06-03',
  '2024-06-10', '2024-06-29', '2024-07-20', '2024-08-07',
  '2024-08-15', '2024-10-14', '2024-11-01', '2024-11-11',
  '2024-12-08', '2024-12-25',
  // 2025, 2026...
]);

export function esDiaHabil(fecha: Date): boolean { ... }
export function diasHabilesEntre(inicio: Date, fin: Date): number { ... }
export function agregarDiasHabiles(fecha: Date, n: number): Date { ... }
```

- Mirror of backend logic for client-side validation
- Used in solicitud form (5-day check) and professor scheduling (10-day check)

### 3.2 Notification Service (`src/app/core/services/notification.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificaciones = signal<Notificacion[]>([]);
  private noLeidas = signal<number>(0);

  // Computed
  readonly tieneNoLeidas = computed(() => this.noLeidas() > 0);

  // Methods
  cargarNotificaciones(): void { ... }
  contarNoLeidas(): void { ... }
  marcarLeida(id: string): void { ... }
  marcarTodasLeidas(): void { ... }
}
```

### 3.3 Notification Bell Component (`src/app/shared/components/notification-bell/`)

- Bell icon with red badge showing exact unread count
- Click toggles dropdown panel
- Each notification shows: type icon, title, message, relative time
- Click notification → mark as read + navigate to context
- "Mark all as read" button
- Auto-refreshes count every 30 seconds

### 3.4 Solicitud Supletorio Form Updates

- Refine `excedeLimite` signal to use `diasHabilesEntre()` instead of simple `diff > 5`
- Show warning banner when exceeding limit (non-blocking, admin can override)

### 3.5 Mis Supletorios (Estudiante) Updates

- Add column "Fecha Examen" when `fecha_examen_supletorio` exists
- Add column "Nota" when estado is `realizado`
- Show exam date card when professor schedules

### 3.6 Professor Panel (`supletorios-pendientes`) — Full API Integration

Replace hardcoded data with real API calls:

```typescript
export class SupletoriosPendientesComponent {
  supletorios = signal<SupletorioPendiente[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {
    this.cargarSupletorios();
  }

  cargarSupletorios(): void {
    this.http.get<SupletorioPendiente[]>('/api/supletorios/profesor/pendientes/')
      .subscribe(data => { ... });
  }
}
```

- **Schedule button** → modal with datepicker (validates 10 business days)
- **Grade button** → modal with numeric input 0-100 + textarea
- Buttons enabled/disabled based on supletorio estado

### 3.7 Admin Bandeja Supletorios Updates

- Add column "Fecha Examen" when available
- Add column "Nota" when available
- Existing approval/rejection/payment flow unchanged

### 3.8 Navbar Integration

Add notification bell to `app.component.html` navbar:

```html
<app-notification-bell />
```

- Visible for all authenticated roles
- Positioned next to user menu

---

## 4. Out of Scope

- **Email notifications** — already handled by `utils.email.enviar_correo`, not modified
- **WebSocket/real-time** — notifications refresh on panel open or page refresh
- **Dynamic multi-year holidays** — hardcoded is sufficient for project timeline
- **Approval/rejection flow changes** — existing admin workflow preserved
- **Browser push notifications** — not required
- **Digital acta signing** — external requirement, not Phase 3
- **Supletorio statistics/analytics** — future feature

---

## 5. Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Holiday data source | Hardcoded list | No external API dependency, simple, sufficient for project scope |
| Notification storage | DB model | Persists across sessions, queryable, supports unread count |
| Notification architecture | Centralized service | Single source of truth, testable, keeps views clean |
| Exam scheduling | Professor only | Professor has domain expertise on availability |
| Grade format | Integer 0-100 | User preference, standard academic scale |
| Unread indicator | Exact count | More informative than binary dot |
| Client-side business days | Mirror of backend logic | Enables real-time validation in forms |

---

## 6. Affected Files

### Backend (new)
- `app/supletorios/business_days.py`
- `app/usuarios/models.py` (Notificacion model)
- `app/usuarios/notification_service.py`
- `app/usuarios/views.py` (notification endpoints)

### Backend (modified)
- `app/supletorios/models.py` — new fields on Supletorio
- `app/supletorios/serializers.py` — schedule/grade serializers
- `app/supletorios/views.py` — schedule/grade endpoints + notification triggers
- `app/supletorios/urls.py` — new routes
- `app/usuarios/urls.py` — notification routes
- `app/usuarios/serializers.py` — notification serializer

### Frontend (new)
- `src/app/core/utils/business-days.ts`
- `src/app/core/services/notification.service.ts`
- `src/app/shared/components/notification-bell/notification-bell.component.ts`
- `src/app/shared/components/notification-bell/notification-bell.component.html`
- `src/app/shared/components/notification-bell/notification-bell.component.scss`

### Frontend (modified)
- `src/app/features/estudiante/solicitud-supletorio/` — business day validation
- `src/app/features/estudiante/mis-supletorios/` — exam date + grade columns
- `src/app/features/profesor/supletorios-pendientes/` — API integration + modals
- `src/app/features/admin/bandeja-supletorios/` — exam date + grade columns
- `src/app/app.component.html` — bell in navbar
- `src/app/app.component.ts` — notification service injection
- `src/app/models/` — Supletorio + Notificacion interfaces
