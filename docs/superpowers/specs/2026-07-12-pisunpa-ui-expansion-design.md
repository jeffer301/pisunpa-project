# Pisunpa UI Expansion - Design Spec

## Overview

Expand the Pisunpa Angular 19 frontend with a Dashboard, User Management module, and Frontend RBAC. All data remains mock (no HTTP calls). Follows Modern Angular patterns: Standalone Components, `ChangeDetectionStrategy.OnPush`, signals for state, `inject()` for DI.

## Architecture

Domain-based folder structure:

```
src/app/
├── core/
│   └── auth/
│       ├── auth.service.ts          # Signal: usuarioActivo, tienePermiso()
│       └── role.model.ts            # Rol type
├── shared/
│   └── components/
│       ├── modal/
│       │   ├── modal.component.ts
│       │   └── modal.component.html
│       └── stat-card/
│           ├── stat-card.component.ts
│           └── stat-card.component.html
├── features/
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.component.html
│   ├── egresados/
│   │   ├── egresados.component.ts
│   │   ├── egresados.component.html
│   │   └── egresado-modal/
│   │       ├── egresado-modal.component.ts
│   │       └── egresado-modal.component.html
│   └── admin/
│       ├── admin.component.ts
│       ├── admin.component.html
│       └── usuario-modal/
│           ├── usuario-modal.component.ts
│           └── usuario-modal.component.html
├── models/
│   ├── egresado.model.ts
│   ├── programa.model.ts
│   ├── departamento.model.ts
│   ├── ciudad.model.ts
│   └── usuario.model.ts
├── services/
│   ├── egresados.service.ts
│   └── usuarios.service.ts
├── app.component.ts
├── app.component.html
└── app.routes.ts
```

## Models

```typescript
// role.model.ts
export type Rol = 'administrador' | 'director' | 'secretario' | 'profesor' | 'egresado';

// usuario.model.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}
```

Existing models (Egresado, Programa, Departamento, Ciudad) remain unchanged.

## Core: Auth Service and RBAC

### AuthService

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuarioActivo = signal<Usuario>(USUARIOS_MOCK[0]); // Default: admin

  usuarioActivo = this._usuarioActivo.asReadonly();

  tienePermiso(accion: 'leer' | 'escribir'): boolean {
    const rol = this._usuarioActivo().rol;
    if (accion === 'leer') return true; // Todos leen
    return ['administrador', 'director', 'secretario'].includes(rol);
  }

  cambiarUsuario(usuario: Usuario): void {
    this._usuarioActivo.set(usuario);
  }
}
```

### RBAC Behavior

- **Todos los roles**: pueden ver la tabla de egresados y el dashboard
- **Solo lectura** (Egresado, Profesor): botones de Eliminar, Editar y link a Registrar se ocultan/deshabilitan
- **Escritura** (Administrador, Director, Secretario): todos los botones habilitados
- Badge discreto "Modo lectura" visible cuando el usuario no tiene permisos de escritura
- Navbar: link a `/registrar` se deshabilita para roles de solo lectura

### Role Selector (Navbar)

- Dropdown en el navbar: "Rol: [Nombre Rol] ▾"
- Al seleccionar otro usuario, se actualiza el signal y la UI reacciona automáticamente
- Muestra el nombre del usuario activo y su rol

## Features: Dashboard (`/dashboard`)

### StatCard Component

Reusable card component with `ChangeDetectionStrategy.OnPush`:

```typescript
@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat-card">
      <span class="stat-label">{{ label() }}</span>
      <span class="stat-value">{{ value() }}</span>
      @if (subtitle()) {
        <span class="stat-subtitle">{{ subtitle() }}</span>
      }
    </div>
  `
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>();
}
```

### Dashboard Component

Three KPI cards in a responsive grid:

1. **Total Egresados**: count of all egresados
2. **Tasa de Empleabilidad**: percentage and fraction (employed / total)
3. **Distribución Geográfica**: top 5 ciudades with count per city

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
export class DashboardComponent {
  private egresadosService = inject(EgresadosService);

  egresados = signal<Egresado[]>([]);

  totalEgresados = computed(() => this.egresados().length);

  tasaEmpleabilidad = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '0%';
    const trabajando = this.egresados().filter(e => e.trabajaActualmente).length;
    return `${((trabajando / total) * 100).toFixed(1)}%`;
  });

  distribucionGeografica = computed(() => {
    const conteo = new Map<number, number>();
    this.egresados().forEach(e => {
      conteo.set(e.idCiudad, (conteo.get(e.idCiudad) || 0) + 1);
    });
    // Sort descending, take top 5, resolve city names
    ...
  });

  ngOnInit() {
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
  }
}
```

### Layout

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Total           │  │  Tasa de        │  │  Distribución   │
│  Egresados       │  │  Empleabilidad  │  │  Geográfica     │
│      128         │  │    73.4%        │  │  • Buenaventura │
│                  │  │    (94/128)     │  │  • Cali (12)    │
│                  │  │                 │  │  • Popayán (8)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- 3-column grid on desktop, stack on mobile
- Cards use navy/white theme consistent with navbar

## Features: Egresados (updated)

### Changes to existing component

- Refactor `TablaEgresadosComponent` → `EgresadosComponent` (rename for clarity)
- Add "Editar" button per row (opens modal)
- Add RBAC checks: hide/disable buttons based on `AuthService.tienePermiso('escribir')`
- Show "Modo lectura" badge when read-only
- Use signals for local state (filtros, egresadosFiltrados)

### Edit Modal (`egresado-modal`)

- Reuses the same form fields as the registration form
- Opens as overlay on top of the table
- Pre-fills with selected egresado data
- "Guardar" updates the egresado in the service
- "Cancelar" closes without changes
- RBAC: only users with write permission see the Edit button

## Features: Admin (`/admin`)

### Admin Component

Table of system users with actions:

| Nombre | Email | Rol | Acciones |
|--------|-------|-----|----------|
| Admin General | admin@pisunpa.com | Administrador | Editar |
| Dr. Fernando Roa | roa@pisunpa.com | Director | Editar |
| ... | ... | ... | ... |

- "Nuevo Usuario" button (top-right)
- RBAC: only Administrador and Director can access/manage users

### UsuarioModal Component

Form fields:
- Nombre (text, required)
- Email (email, required)
- Rol (select, required): Administrador, Director, Secretario, Profesor, Egresado
- Activo (checkbox)

- Opens for create or edit
- "Guardar" persists to UsuariosService signal state
- "Cancelar" closes

### UsuariosService

```typescript
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private _usuarios = signal<Usuario[]>(USUARIOS_MOCK);

  usuarios = this._usuarios.asReadonly();

  guardar(usuario: Omit<Usuario, 'id'>): void {
    const nuevo = { ...usuario, id: this.nextId++ };
    this._usuarios.update(list => [...list, nuevo]);
  }

  actualizar(usuario: Usuario): void {
    this._usuarios.update(list =>
      list.map(u => u.id === usuario.id ? usuario : u)
    );
  }

  eliminar(id: number): void {
    this._usuarios.update(list => list.filter(u => u.id !== id));
  }
}
```

### Mock Data (5 initial users)

```typescript
const USUARIOS_MOCK: Usuario[] = [
  { id: 1, nombre: 'Admin General', email: 'admin@pisunpa.com', rol: 'administrador', activo: true },
  { id: 2, nombre: 'Dr. Fernando Roa', email: 'roa@pisunpa.com', rol: 'director', activo: true },
  { id: 3, nombre: 'Ana María López', email: 'ana@pisunpa.com', rol: 'secretario', activo: true },
  { id: 4, nombre: 'Carlos Pérez', email: 'carlos@pisunpa.com', rol: 'profesor', activo: true },
  { id: 5, nombre: 'Juan Estudiante', email: 'juan@pisunpa.com', rol: 'egresado', activo: true },
];
```

## Routes

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'egresados', component: EgresadosComponent },
  { path: 'registrar', component: FormularioEgresadoComponent },
  { path: 'admin', component: AdminComponent },
];
```

## Styling

- Maintain existing CSS custom approach (no external libraries)
- Navy (#0a2463) + white palette consistent with navbar
- Stat cards: white background, subtle shadow, colored left border accent
- Modal: centered overlay with backdrop, max-width 600px
- Responsive: CSS grid for dashboard cards, flex-wrap for filters
- All component styles use `:host { display: block; }` for encapsulation

## Angular Patterns

- All components: `standalone: true`, `ChangeDetectionStrategy.OnPush`
- DI: `inject()` instead of constructor injection
- State: signals (`signal()`, `computed()`, `effect()`)
- Templates: `@if` / `@for` control flow (Angular 17+)
- Forms: Reactive forms with `formControlName`
- Inputs/Outputs: `input()` / `output()` signal-based APIs

## Files to Create/Modify

### New files (16)
1. `src/app/core/auth/role.model.ts`
2. `src/app/core/auth/auth.service.ts`
3. `src/app/shared/components/stat-card/stat-card.component.ts`
4. `src/app/shared/components/stat-card/stat-card.component.html`
5. `src/app/shared/components/modal/modal.component.ts`
6. `src/app/shared/components/modal/modal.component.html`
7. `src/app/features/dashboard/dashboard.component.ts`
8. `src/app/features/dashboard/dashboard.component.html`
9. `src/app/features/egresados/egresado-modal/egresado-modal.component.ts`
10. `src/app/features/egresados/egresado-modal/egresado-modal.component.html`
11. `src/app/features/admin/admin.component.ts`
12. `src/app/features/admin/admin.component.html`
13. `src/app/features/admin/usuario-modal/usuario-modal.component.ts`
14. `src/app/features/admin/usuario-modal/usuario-modal.component.html`
15. `src/app/models/usuario.model.ts`
16. `src/app/services/usuarios.service.ts`

### Files to modify (5)
1. `src/app/app.routes.ts` — add dashboard and admin routes
2. `src/app/app.component.html` — add role selector, update nav links
3. `src/app/app.component.ts` — inject AuthService
4. `src/app/services/egresados.service.ts` — add signals-based methods
5. `src/styles.css` — add new styles for stat cards, modals, admin table

### Files to relocate (rename)
1. `components/tabla-egresados/` → `features/egresados/` (with refactored component)
2. `components/formulario-egresado/` → `features/egresados/` (keep existing)

### Files to delete
1. `components/tabla-egresados/` (after relocation)
2. `components/formulario-egresado/` (after relocation)
3. Empty `components/` directory
