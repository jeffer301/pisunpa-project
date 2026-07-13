# Pisunpa UI Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Pisunpa Angular 19 frontend with a Dashboard (KPIs), User Management module (RBAC), and role-based UI controls using signals and Modern Angular patterns.

**Architecture:** Domain-based folder structure (core/, shared/, features/) with signal-driven state management, standalone components, and OnPush change detection. All data is mock — no HTTP calls.

**Tech Stack:** Angular 19, TypeScript 5.7, RxJS 7.8, CSS custom (no UI libraries)

## Global Constraints

- Angular 19.2+ — use `@if` / `@for` control flow, `input()` / `output()` signal APIs
- All components: `standalone: true`, `ChangeDetectionStrategy.OnPush`
- DI: `inject()` only (no constructor injection)
- State: `signal()`, `computed()`, `effect()` — no BehaviorSubject for new code
- Palette: navy #0a2463, white, #3da5d9 accent
- No external UI libraries — CSS custom only
- Spanish labels throughout (matching existing codebase)

---

## Task 1: Models and Core Auth Service

**Files:**
- Create: `frontend/src/app/core/auth/role.model.ts`
- Create: `frontend/src/app/models/usuario.model.ts`
- Create: `frontend/src/app/core/auth/auth.service.ts`
- Create: `frontend/src/app/services/usuarios.service.ts`

**Interfaces:**
- Consumes: none (foundational task)
- Produces: `Rol`, `Usuario`, `AuthService.usuarioActivo()`, `AuthService.tienePermiso()`, `AuthService.cambiarUsuario()`, `UsuariosService.usuarios()`, `UsuariosService.guardar()`, `UsuariosService.actualizar()`, `UsuariosService.eliminar()`

- [ ] **Step 1: Create role.model.ts**

```typescript
// frontend/src/app/core/auth/role.model.ts
export type Rol = 'administrador' | 'director' | 'secretario' | 'profesor' | 'egresado';

export const ROL_LABELS: Record<Rol, string> = {
  administrador: 'Administrador',
  director: 'Director',
  secretario: 'Secretario',
  profesor: 'Profesor',
  egresado: 'Egresado',
};
```

- [ ] **Step 2: Create usuario.model.ts**

```typescript
// frontend/src/app/models/usuario.model.ts
import { Rol } from '../core/auth/role.model';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}
```

- [ ] **Step 3: Create usuarios.service.ts**

```typescript
// frontend/src/app/services/usuarios.service.ts
import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

const USUARIOS_MOCK: Usuario[] = [
  { id: 1, nombre: 'Admin General', email: 'admin@pisunpa.com', rol: 'administrador', activo: true },
  { id: 2, nombre: 'Dr. Fernando Roa', email: 'roa@pisunpa.com', rol: 'director', activo: true },
  { id: 3, nombre: 'Ana María López', email: 'ana@pisunpa.com', rol: 'secretario', activo: true },
  { id: 4, nombre: 'Carlos Pérez', email: 'carlos@pisunpa.com', rol: 'profesor', activo: true },
  { id: 5, nombre: 'Juan Estudiante', email: 'juan@pisunpa.com', rol: 'egresado', activo: true },
];

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private _usuarios = signal<Usuario[]>(USUARIOS_MOCK);
  private nextId = 6;

  usuarios = this._usuarios.asReadonly();

  guardar(usuario: Omit<Usuario, 'id'>): void {
    const nuevo: Usuario = { ...usuario, id: this.nextId++ };
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

  getById(id: number): Usuario | undefined {
    return this._usuarios().find(u => u.id === id);
  }
}
```

- [ ] **Step 4: Create auth.service.ts**

```typescript
// frontend/src/app/core/auth/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuariosService = inject(UsuariosService);
  private _usuarioActivo = signal<Usuario>(this.usuariosService.getById(1)!);

  usuarioActivo = this._usuarioActivo.asReadonly();

  tienePermiso(accion: 'leer' | 'escribir'): boolean {
    const rol = this._usuarioActivo().rol;
    if (accion === 'leer') return true;
    return ['administrador', 'director', 'secretario'].includes(rol);
  }

  cambiarUsuario(usuario: Usuario): void {
    this._usuarioActivo.set(usuario);
  }
}
```

Note: `inject` must be imported from `@angular/core`.

- [ ] **Step 5: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL (no errors)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/ frontend/src/app/models/usuario.model.ts frontend/src/app/services/usuarios.service.ts
git commit -m "feat: add models, auth service, and usuarios service with mock data"
```

---

## Task 2: Shared StatCard Component

**Files:**
- Create: `frontend/src/app/shared/components/stat-card/stat-card.component.ts`

**Interfaces:**
- Consumes: none
- Produces: `<app-stat-card [label] [value] [subtitle] />` — reusable KPI card

- [ ] **Step 1: Create stat-card.component.ts (inline template)**

```typescript
// frontend/src/app/shared/components/stat-card/stat-card.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .stat-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border-left: 4px solid #0a2463;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
      font-weight: 600;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #0a2463;
    }
    .stat-subtitle {
      font-size: 0.85rem;
      color: #888;
    }
  `],
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

- [ ] **Step 2: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/shared/
git commit -m "feat: add shared StatCard component"
```

---

## Task 3: Shared Modal Component

**Files:**
- Create: `frontend/src/app/shared/components/modal/modal.component.ts`

**Interfaces:**
- Consumes: none
- Produces: `<app-modal [titulo] (cerrar)="handler"> <ng-content /> </app-modal>` — reusable modal overlay

- [ ] **Step 1: Create modal.component.ts (inline template)**

```typescript
// frontend/src/app/shared/components/modal/modal.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #0a2463;
    }
    .btn-cerrar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.25rem;
      line-height: 1;
    }
    .btn-cerrar:hover { color: #333; }
  `],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ titulo() }}</h3>
          <button class="btn-cerrar" (click)="cerrar.emit()">&times;</button>
        </div>
        <ng-content />
      </div>
    </div>
  `
})
export class ModalComponent {
  titulo = input.required<string>();
  cerrar = output<void>();

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrar.emit();
    }
  }
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/shared/components/modal/
git commit -m "feat: add shared Modal component"
```

---

## Task 4: Dashboard Component with KPIs

**Files:**
- Create: `frontend/src/app/features/dashboard/dashboard.component.ts`

**Interfaces:**
- Consumes: `EgresadosService.getEgresados()`, `EgresadosService.getCiudades()`, `StatCardComponent`
- Produces: `<app-dashboard />` — renders 3 KPI stat cards

- [ ] **Step 1: Create dashboard.component.ts (inline template)**

```typescript
// frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { EgresadosService } from '../../services/egresados.service';
import { Ciudad } from '../../models/ciudad.model';
import { Egresado } from '../../models/egresado.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .dashboard-header {
      margin-bottom: 1.5rem;
    }
    .dashboard-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }
    .dashboard-header p {
      color: #666;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
  `],
  template: `
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <p>Indicadores clave del sistema de egresados</p>
    </div>

    <div class="kpi-grid">
      <app-stat-card
        label="Total Egresados"
        [value]="totalEgresados()"
      />

      <app-stat-card
        label="Tasa de Empleabilidad"
        [value]="tasaEmpleabilidad()"
        [subtitle]="empleabilidadDetalle()"
      />

      <app-stat-card
        label="Distribución Geográfica"
        value=""
        [subtitle]="distribucionGeografica()"
      />
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private egresadosService = inject(EgresadosService);

  egresados = signal<Egresado[]>([]);
  ciudades = signal<Ciudad[]>([]);

  totalEgresados = computed(() => this.egresados().length);

  tasaEmpleabilidad = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '0%';
    const trabajando = this.egresados().filter(e => e.trabajaActualmente).length;
    return `${((trabaja / total) * 100).toFixed(1)}%`;
  });

  empleabilidadDetalle = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '';
    const trabajando = this.egresados().filter(e => e.trabajaActualmente).length;
    return `${trabajando} de ${total} egresados`;
  });

  distribucionGeografica = computed(() => {
    const conteo = new Map<number, number>();
    this.egresados().forEach(e => {
      conteo.set(e.idCiudad, (conteo.get(e.idCiudad) || 0) + 1);
    });

    const ciudadMap = new Map(this.ciudades().map(c => [c.id, c.nombre]));

    const sorted = [...conteo.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted
      .map(([id, count]) => `${ciudadMap.get(id) ?? 'Desconocido'} (${count})`)
      .join(' · ');
  });

  ngOnInit(): void {
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
    this.egresadosService.getCiudades().subscribe(c => this.ciudades.set(c));
  }
}
```

Note: fix the typo `trabaja` → `trabajando` in `tasaEmpleabilidad` computed before committing.

- [ ] **Step 2: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/dashboard/
git commit -m "feat: add Dashboard component with KPI stat cards"
```

---

## Task 5: Refactor Egresados — Rename and Migrate to features/

**Files:**
- Create: `frontend/src/app/features/egresados/egresados.component.ts` (refactored from tabla-egresados)
- Create: `frontend/src/app/features/egresados/egresados.component.html` (from tabla-egresados)
- Delete: `frontend/src/app/components/tabla-egresados/` (after migration)
- Delete: `frontend/src/app/components/formulario-egresado/` (after migration)
- Move: `frontend/src/app/features/egresados/formulario-egresado.component.ts` + `.html`

**Interfaces:**
- Consumes: `EgresadosService`, `AuthService.tienePermiso()`
- Produces: `<app-egresados />` — table with RBAC-aware buttons

- [ ] **Step 1: Create features/egresados/egresados.component.ts**

Migrate the existing `TablaEgresadosComponent` to this new path, refactoring to use signals and OnPush:

```typescript
// frontend/src/app/features/egresados/egresados.component.ts
import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EgresadosService } from '../../services/egresados.service';
import { AuthService } from '../../core/auth/auth.service';
import { Egresado } from '../../models/egresado.model';
import { Programa } from '../../models/programa.model';
import { Departamento } from '../../models/departamento.model';
import { Ciudad } from '../../models/ciudad.model';

@Component({
  selector: 'app-egresados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './egresados.component.html',
})
export class EgresadosComponent implements OnInit {
  private egresadosService = inject(EgresadosService);
  authService = inject(AuthService);

  egresados = signal<Egresado[]>([]);
  egresadosFiltrados = signal<Egresado[]>([]);
  programas = signal<Programa[]>([]);
  departamentos = signal<Departamento[]>([]);
  ciudades = signal<Ciudad[]>([]);

  filtroNombre = signal('');
  filtroPrograma = signal(0);
  filtroLaboral = signal<'todos' | 'trabaja' | 'no_trabaja'>('todos');

  private mapaProgramas = new Map<number, string>();
  private mapaCiudades = new Map<number, string>();
  private mapaDepartamentos = new Map<number, string>();

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => {
      this.programas.set(p);
      p.forEach(prog => this.mapaProgramas.set(prog.id, prog.nombre));
    });
    this.egresadosService.getDepartamentos().subscribe(d => {
      this.departamentos.set(d);
      d.forEach(dep => this.mapaDepartamentos.set(dep.id, dep.nombre));
    });
    this.egresadosService.getCiudades().subscribe(c => {
      this.ciudades.set(c);
      c.forEach(ciudad => this.mapaCiudades.set(ciudad.id, ciudad.nombre));
    });
    this.egresadosService.getEgresados().subscribe(e => {
      this.egresados.set(e);
      this.egresadosFiltrados.set([...e]);
    });
  }

  nombrePrograma(id: number): string {
    return this.mapaProgramas.get(id) ?? '—';
  }

  nombreCiudad(id: number): string {
    return this.mapaCiudades.get(id) ?? '—';
  }

  nombreDepartamento(id: number): string {
    return this.mapaDepartamentos.get(id) ?? '—';
  }

  onFiltroNombre(valor: string): void {
    this.filtroNombre.set(valor);
    this.aplicarFiltros();
  }

  onFiltroPrograma(valor: number): void {
    this.filtroPrograma.set(Number(valor));
    this.aplicarFiltros();
  }

  onFiltroLaboral(valor: string): void {
    this.filtroLaboral.set(valor as 'todos' | 'trabaja' | 'no_trabaja');
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = [...this.egresados()];
    const nombre = this.filtroNombre();
    const programa = this.filtroPrograma();
    const laboral = this.filtroLaboral();

    if (nombre.trim()) {
      const busqueda = nombre.toLowerCase();
      resultado = resultado.filter(e =>
        e.nombres.toLowerCase().includes(busqueda) ||
        e.apellidos.toLowerCase().includes(busqueda)
      );
    }

    if (programa) {
      resultado = resultado.filter(e => e.idPrograma === programa);
    }

    if (laboral === 'trabaja') {
      resultado = resultado.filter(e => e.trabajaActualmente);
    } else if (laboral === 'no_trabaja') {
      resultado = resultado.filter(e => !e.trabajaActualmente);
    }

    this.egresadosFiltrados.set(resultado);
  }

  eliminar(id: number): void {
    this.egresadosService.eliminarEgresado(id).subscribe(() => {
      this.egresados.update(list => list.filter(e => e.id !== id));
      this.aplicarFiltros();
    });
  }
}
```

- [ ] **Step 2: Create features/egresados/egresados.component.html**

```html
<!-- frontend/src/app/features/egresados/egresados.component.html -->
<div class="contenedor">
  <div class="header-row">
    <div>
      <h2>Dashboard de Egresados</h2>
      @if (!authService.tienePermiso('escribir')) {
        <span class="badge-lectura">Modo lectura</span>
      }
    </div>
  </div>

  <div class="filtros">
    <input
      type="text"
      placeholder="Buscar por nombre o apellido..."
      [value]="filtroNombre()"
      (input)="onFiltroNombre($any($event.target).value)"
    />

    <select [value]="filtroPrograma()" (change)="onFiltroPrograma($any($event.target).value)">
      <option [ngValue]="0">Todos los programas</option>
      @for (p of programas(); track p.id) {
        <option [ngValue]="p.id">{{ p.nombre }}</option>
      }
    </select>

    <select [value]="filtroLaboral()" (change)="onFiltroLaboral($any($event.target).value)">
      <option value="todos">Todos</option>
      <option value="trabaja">Trabaja</option>
      <option value="no_trabaja">No trabaja</option>
    </select>
  </div>

  <p class="contador">{{ egresadosFiltrados().length }} egresado(s) encontrado(s)</p>

  <table>
    <thead>
      <tr>
        <th>Nombre Completo</th>
        <th>Programa</th>
        <th>Ubicación</th>
        <th>¿Trabaja?</th>
        <th>Empresa</th>
        @if (authService.tienePermiso('escribir')) {
          <th>Acciones</th>
        }
      </tr>
    </thead>
    <tbody>
      @for (e of egresadosFiltrados(); track e.id) {
        <tr>
          <td>{{ e.nombres }} {{ e.apellidos }}</td>
          <td>{{ nombrePrograma(e.idPrograma) }}</td>
          <td>{{ nombreCiudad(e.idCiudad) }} — {{ nombreDepartamento(e.idDepartamento) }}</td>
          <td>{{ e.trabajaActualmente ? 'Sí' : 'No' }}</td>
          <td>{{ e.trabajaActualmente ? e.empresa : '—' }}</td>
          @if (authService.tienePermiso('escribir')) {
            <td class="acciones">
              <button class="btn-eliminar" (click)="eliminar(e.id)">Eliminar</button>
            </td>
          }
        </tr>
      } @empty {
        <tr>
          <td [attr.colspan]="authService.tienePermiso('escribir') ? 6 : 5" class="vacio">
            No se encontraron egresados.
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

- [ ] **Step 3: Move formulario-egresado to features/egresados/**

Copy the existing `formulario-egresado.component.ts` and `.html` from `components/formulario-egresado/` to `features/egresados/`. Keep the code identical — just change import paths if needed (they should still work since `services/` and `models/` are at `../../` relative path from both locations).

- [ ] **Step 4: Delete old components/ directory**

```bash
rm -rf frontend/src/app/components/
```

- [ ] **Step 5: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/features/egresados/ frontend/src/app/components/
git commit -m "feat: migrate egresados and formulario to features/egresados/ with RBAC"
```

---

## Task 5b: Egresado Edit Modal

**Files:**
- Create: `frontend/src/app/features/egresados/egresado-modal/egresado-modal.component.ts`
- Create: `frontend/src/app/features/egresados/egresado-modal/egresado-modal.component.html`
- Modify: `frontend/src/app/features/egresados/egresados.component.ts` — add edit modal state
- Modify: `frontend/src/app/features/egresados/egresados.component.html` — add Edit button and modal

**Interfaces:**
- Consumes: `ModalComponent`, `EgresadosService`, `Egresado`, `Programa`, `Departamento`, `Ciudad`
- Produces: `<app-egresado-modal [titulo] [egresado] (guardar) (cerrar) />` — edit form modal

- [ ] **Step 1: Create egresado-modal.component.ts**

```typescript
// frontend/src/app/features/egresados/egresado-modal/egresado-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Egresado } from '../../../models/egresado.model';
import { Programa } from '../../../models/programa.model';
import { Departamento } from '../../../models/departamento.model';
import { Ciudad } from '../../../models/ciudad.model';
import { EgresadosService } from '../../../services/egresados.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-egresado-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './egresado-modal.component.html',
})
export class EgresadoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private egresadosService = inject(EgresadosService);

  titulo = input.required<string>();
  egresado = input<Egresado | null>(null);
  guardar = output<Egresado>();
  cerrar = output<void>();

  formulario!: FormGroup;
  programas: Programa[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];

  ngOnInit(): void {
    const e = this.egresado();

    this.formulario = this.fb.group({
      nombres: [e?.nombres ?? '', Validators.required],
      apellidos: [e?.apellidos ?? '', Validators.required],
      direccion: [e?.direccion ?? '', Validators.required],
      edad: [e?.edad ?? null, [Validators.required, Validators.min(18)]],
      fechaGraduacion: [e ? this.formatDate(e.fechaGraduacion) : '', Validators.required],
      idPrograma: [e?.idPrograma ?? 1, Validators.required],
      idDepartamento: [e?.idDepartamento ?? 1, Validators.required],
      idCiudad: [e?.idCiudad ?? 1, Validators.required],
      trabajaActualmente: [e?.trabajaActualmente ?? true, Validators.required],
      empresa: [e?.empresa ?? ''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos = d);
    this.egresadosService.getCiudadesByDepartamento(this.formulario.get('idDepartamento')!.value)
      .subscribe(c => this.ciudades = c);

    this.formulario.get('idDepartamento')!.valueChanges.subscribe(id => {
      this.egresadosService.getCiudadesByDepartamento(id).subscribe(c => {
        this.ciudades = c;
        this.formulario.get('idCiudad')!.setValue(c.length ? c[0].id : null);
      });
    });

    this.formulario.get('trabajaActualmente')!.valueChanges.subscribe(trabaja => {
      const empresaCtrl = this.formulario.get('empresa')!;
      if (trabaja) {
        empresaCtrl.setValidators([Validators.required]);
      } else {
        empresaCtrl.clearValidators();
        empresaCtrl.setValue('');
      }
      empresaCtrl.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const e = this.egresado();

    this.guardar.emit({
      id: e?.id ?? 0,
      nombres: val.nombres,
      apellidos: val.apellidos,
      direccion: val.direccion,
      edad: val.edad,
      fechaGraduacion: new Date(val.fechaGraduacion),
      idPrograma: val.idPrograma,
      idDepartamento: val.idDepartamento,
      idCiudad: val.idCiudad,
      trabajaActualmente: val.trabajaActualmente,
      empresa: val.trabajaActualmente ? val.empresa : '',
    });
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  private formatDate(fecha: Date): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }
}
```

- [ ] **Step 2: Create egresado-modal.component.html**

```html
<!-- frontend/src/app/features/egresados/egresado-modal/egresado-modal.component.html -->
<app-modal [titulo]="titulo()" (cerrar)="cerrar.emit()">
  <form [formGroup]="formulario" (ngSubmit)="onSubmit()">

    <div class="campo">
      <label for="nombres">Nombres *</label>
      <input id="nombres" formControlName="nombres" />
      @if (campoInvalido('nombres')) {
        <span class="error">Campo obligatorio.</span>
      }
    </div>

    <div class="campo">
      <label for="apellidos">Apellidos *</label>
      <input id="apellidos" formControlName="apellidos" />
      @if (campoInvalido('apellidos')) {
        <span class="error">Campo obligatorio.</span>
      }
    </div>

    <div class="campo">
      <label for="direccion">Dirección *</label>
      <input id="direccion" formControlName="direccion" />
      @if (campoInvalido('direccion')) {
        <span class="error">Campo obligatorio.</span>
      }
    </div>

    <div class="campo">
      <label for="edad">Edad *</label>
      <input id="edad" type="number" formControlName="edad" />
      @if (campoInvalido('edad')) {
        <span class="error">Edad mínima 18 años.</span>
      }
    </div>

    <div class="campo">
      <label for="fechaGraduacion">Fecha de Graduación *</label>
      <input id="fechaGraduacion" type="date" formControlName="fechaGraduacion" />
      @if (campoInvalido('fechaGraduacion')) {
        <span class="error">Campo obligatorio.</span>
      }
    </div>

    <div class="campo">
      <label for="idPrograma">Programa *</label>
      <select id="idPrograma" formControlName="idPrograma">
        @for (p of programas; track p.id) {
          <option [value]="p.id">{{ p.nombre }}</option>
        }
      </select>
    </div>

    <fieldset>
      <legend>Ubicación</legend>
      <div class="campo">
        <label for="idDepartamento">Departamento *</label>
        <select id="idDepartamento" formControlName="idDepartamento">
          @for (d of departamentos; track d.id) {
            <option [value]="d.id">{{ d.nombre }}</option>
          }
        </select>
      </div>
      <div class="campo">
        <label for="idCiudad">Ciudad *</label>
        <select id="idCiudad" formControlName="idCiudad">
          @for (c of ciudades; track c.id) {
            <option [value]="c.id">{{ c.nombre }}</option>
          }
        </select>
      </div>
    </fieldset>

    <fieldset>
      <legend>Situación Laboral</legend>
      <div class="campo-radio">
        <label>¿Trabaja actualmente? *</label>
        <label><input type="radio" formControlName="trabajaActualmente" [value]="true" /> Sí</label>
        <label><input type="radio" formControlName="trabajaActualmente" [value]="false" /> No</label>
      </div>
      @if (formulario.get('trabajaActualmente')!.value) {
        <div class="campo">
          <label for="empresa">Empresa *</label>
          <input id="empresa" formControlName="empresa" />
          @if (campoInvalido('empresa')) {
            <span class="error">Campo obligatorio cuando trabaja.</span>
          }
        </div>
      }
    </fieldset>

    <div class="acciones-form">
      <button type="button" class="btn-cancelar" (click)="cerrar.emit()">Cancelar</button>
      <button type="submit" class="btn-guardar">Guardar</button>
    </div>
  </form>
</app-modal>
```

- [ ] **Step 3: Update egresados.component.ts — add edit modal state**

Add to `EgresadosComponent`:

```typescript
// Add these properties:
egresadoSeleccionado: Egresado | null = null;
mostrarModalEdicion = false;

// Add these methods:
abrirEditar(egresado: Egresado): void {
  this.egresadoSeleccionado = { ...egresado };
  this.mostrarModalEdicion = true;
}

cerrarModalEdicion(): void {
  this.mostrarModalEdicion = false;
  this.egresadoSeleccionado = null;
}

onGuardarEdicion(egresado: Egresado): void {
  this.egresadosService.actualizarEgresado(egresado).subscribe(() => {
    this.egresados.update(list =>
      list.map(e => e.id === egresado.id ? egresado : e)
    );
    this.aplicarFiltros();
    this.cerrarModalEdicion();
  });
}
```

Add `EgresadoModalComponent` to imports array.

- [ ] **Step 4: Update egresados.component.html — add Edit button and modal**

In the table row actions, add Edit button before Eliminar:

```html
@if (authService.tienePermiso('escribir')) {
  <td class="acciones">
    <button class="btn-editar" (click)="abrirEditar(e)">Editar</button>
    <button class="btn-eliminar" (click)="eliminar(e.id)">Eliminar</button>
  </td>
}
```

At the bottom of the template, add:

```html
@if (mostrarModalEdicion && egresadoSeleccionado) {
  <app-egresado-modal
    titulo="Editar Egresado"
    [egresado]="egresadoSeleccionado"
    (guardar)="onGuardarEdicion($event)"
    (cerrar)="cerrarModalEdicion()"
  />
}
```

- [ ] **Step 5: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/features/egresados/
git commit -m "feat: add egresado edit modal with form reusability"
```

---

## Task 6: Admin Component — User Management Table

**Files:**
- Create: `frontend/src/app/features/admin/admin.component.ts`
- Create: `frontend/src/app/features/admin/admin.component.html`

**Interfaces:**
- Consumes: `UsuariosService`, `AuthService.tienePermiso()`, `ROL_LABELS`
- Produces: `<app-admin />` — user table with RBAC-gated actions

- [ ] **Step 1: Create admin.component.ts**

```typescript
// frontend/src/app/features/admin/admin.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../core/auth/auth.service';
import { ROL_LABELS } from '../../core/auth/role.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  rolLabels = ROL_LABELS;

  usuarioSeleccionado: Usuario | null = null;
  mostrarModal = false;
  modoEdicion = false;

  get puedeGestionar(): boolean {
    const rol = this.authService.usuarioActivo().rol;
    return rol === 'administrador' || rol === 'director';
  }

  abrirCrear(): void {
    this.usuarioSeleccionado = null;
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  onGuardar(usuario: Omit<Usuario, 'id'> | Usuario): void {
    if (this.modoEdicion && 'id' in usuario) {
      this.usuariosService.actualizar(usuario as Usuario);
    } else {
      this.usuariosService.guardar(usuario as Omit<Usuario, 'id'>);
    }
    this.cerrarModal();
  }

  eliminar(id: number): void {
    this.usuariosService.eliminar(id);
  }
}
```

- [ ] **Step 2: Create admin.component.html**

```html
<!-- frontend/src/app/features/admin/admin.component.html -->
<div class="contenedor">
  <div class="admin-header">
    <div>
      <h2>Administración de Usuarios</h2>
      <p class="subtitulo">Gestiona los usuarios y roles del sistema</p>
    </div>
    @if (puedeGestionar) {
      <button class="btn-nuevo" (click)="abrirCrear()">+ Nuevo Usuario</button>
    }
  </div>

  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Rol</th>
        <th>Estado</th>
        @if (puedeGestionar) {
          <th>Acciones</th>
        }
      </tr>
    </thead>
    <tbody>
      @for (u of usuariosService.usuarios(); track u.id) {
        <tr>
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td><span class="rol-badge">{{ rolLabels[u.rol] }}</span></td>
          <td>
            <span class="estado-badge" [class.activo]="u.activo" [class.inactivo]="!u.activo">
              {{ u.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          @if (puedeGestionar) {
            <td class="acciones">
              <button class="btn-editar" (click)="abrirEditar(u)">Editar</button>
              <button class="btn-eliminar" (click)="eliminar(u.id)">Eliminar</button>
            </td>
          }
        </tr>
      } @empty {
        <tr>
          <td [attr.colspan]="puedeGestionar ? 5 : 4" class="vacio">
            No hay usuarios registrados.
          </td>
        </tr>
      }
    </tbody>
  </table>

  @if (mostrarModal) {
    <app-usuario-modal
      [titulo]="modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'"
      [usuario]="usuarioSeleccionado"
      (guardar)="onGuardar($event)"
      (cerrar)="cerrarModal()"
    />
  }
</div>
```

- [ ] **Step 3: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL (note: `app-usuario-modal` will be resolved in Task 7)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/admin.component.ts frontend/src/app/features/admin/admin.component.html
git commit -m "feat: add Admin component with user management table"
```

---

## Task 7: UsuarioModal Component

**Files:**
- Create: `frontend/src/app/features/admin/usuario-modal/usuario-modal.component.ts`
- Create: `frontend/src/app/features/admin/usuario-modal/usuario-modal.component.html`

**Interfaces:**
- Consumes: `ModalComponent`, `ROL_LABELS`, `Usuario`
- Produces: `<app-usuario-modal [titulo] [usuario] (guardar) (cerrar) />` — create/edit user form

- [ ] **Step 1: Create usuario-modal.component.ts**

```typescript
// frontend/src/app/features/admin/usuario-modal/usuario-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';
import { Rol, ROL_LABELS } from '../../../core/auth/role.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usuario-modal.component.html',
})
export class UsuarioModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  titulo = input.required<string>();
  usuario = input<Usuario | null>(null);
  guardar = output<Omit<Usuario, 'id'> | Usuario>();
  cerrar = output<void>();

  formulario!: FormGroup;
  roles: { value: Rol; label: string }[] = Object.entries(ROL_LABELS).map(
    ([value, label]) => ({ value: value as Rol, label })
  );

  ngOnInit(): void {
    const u = this.usuario();
    this.formulario = this.fb.group({
      nombre: [u?.nombre ?? '', Validators.required],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      rol: [u?.rol ?? 'egresado', Validators.required],
      activo: [u?.activo ?? true],
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const u = this.usuario();

    if (u) {
      this.guardar.emit({ ...u, ...val });
    } else {
      this.guardar.emit(val);
    }
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
```

- [ ] **Step 2: Create usuario-modal.component.html**

```html
<!-- frontend/src/app/features/admin/usuario-modal/usuario-modal.component.html -->
<app-modal [titulo]="titulo()" (cerrar)="cerrar.emit()">
  <form [formGroup]="formulario" (ngSubmit)="onSubmit()">

    <div class="campo">
      <label for="nombre">Nombre *</label>
      <input id="nombre" formControlName="nombre" />
      @if (campoInvalido('nombre')) {
        <span class="error">Campo obligatorio.</span>
      }
    </div>

    <div class="campo">
      <label for="email">Email *</label>
      <input id="email" type="email" formControlName="email" />
      @if (campoInvalido('email')) {
        <span class="error">Ingrese un email válido.</span>
      }
    </div>

    <div class="campo">
      <label for="rol">Rol *</label>
      <select id="rol" formControlName="rol">
        @for (r of roles; track r.value) {
          <option [value]="r.value">{{ r.label }}</option>
        }
      </select>
    </div>

    <div class="campo-cHECKBOX">
      <label>
        <input type="checkbox" formControlName="activo" />
        Activo
      </label>
    </div>

    <div class="acciones-form">
      <button type="button" class="btn-cancelar" (click)="cerrar.emit()">Cancelar</button>
      <button type="submit" class="btn-guardar">Guardar</button>
    </div>
  </form>
</app-modal>
```

- [ ] **Step 3: Add modal form styles to styles.css**

Append to `frontend/src/app/features/admin/usuario-modal/usuario-modal.component.ts` styles, or add inline:

```typescript
// Add to the component's styles array:
styles: [`
  .acciones-form {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
  .btn-cancelar {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .btn-guardar {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background: #0a2463;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .btn-guardar:hover {
    background: #163d8f;
  }
`]
```

- [ ] **Step 4: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/admin/usuario-modal/
git commit -m "feat: add UsuarioModal component for create/edit users"
```

---

## Task 8: Navbar — Role Selector and Updated Navigation

**Files:**
- Modify: `frontend/src/app/app.component.ts`
- Modify: `frontend/src/app/app.component.html`

**Interfaces:**
- Consumes: `AuthService.usuarioActivo()`, `AuthService.tienePermiso()`, `AuthService.cambiarUsuario()`, `UsuariosService.usuarios()`
- Produces: Updated navbar with role selector dropdown and RBAC-aware links

- [ ] **Step 1: Update app.component.ts**

```typescript
// frontend/src/app/app.component.ts
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service';
import { UsuariosService } from './services/usuarios.service';
import { Usuario } from './models/usuario.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  authService = inject(AuthService);
  usuariosService = inject(UsuariosService);

  dropdownAbierto = signal(false);

  toggleDropdown(): void {
    this.dropdownAbierto.update(v => !v);
  }

  cerrarDropdown(): void {
    this.dropdownAbierto.set(false);
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.authService.cambiarUsuario(usuario);
    this.dropdownAbierto.set(false);
  }
}
```

- [ ] **Step 2: Update app.component.html**

```html
<!-- frontend/src/app/app.component.html -->
<nav class="navbar">
  <a class="brand" routerLink="/dashboard">pisunpa.com</a>
  <div class="nav-links">
    <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
    <a routerLink="/egresados" routerLinkActive="active">Egresados</a>
    @if (authService.tienePermiso('escribir')) {
      <a routerLink="/registrar" routerLinkActive="active">Registrar</a>
    }
    <a routerLink="/admin" routerLinkActive="active">Admin</a>
  </div>

  <div class="role-selector">
    <button class="role-btn" (click)="toggleDropdown()">
      {{ authService.usuarioActivo().nombre }} · {{ authService.usuarioActivo().rol | titlecase }}
      <span class="arrow">{{ dropdownAbierto() ? '▴' : '▾' }}</span>
    </button>
    @if (dropdownAbierto()) {
      <div class="role-dropdown" (mouseleave)="cerrarDropdown()">
        @for (u of usuariosService.usuarios(); track u.id) {
          <button
            class="role-option"
            [class.selected]="u.id === authService.usuarioActivo().id"
            (click)="seleccionarUsuario(u)"
          >
            {{ u.nombre }} — <span class="rol-text">{{ u.rol }}</span>
          </button>
        }
      </div>
    }
  </div>
</nav>

<main class="contenido">
  <router-outlet></router-outlet>
</main>
```

- [ ] **Step 3: Add role selector styles to styles.css**

Append to `frontend/src/styles.css`:

```css
/* Role selector */
.role-selector {
  margin-left: auto;
  position: relative;
}

.role-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.role-btn:hover {
  background: rgba(255,255,255,0.2);
}

.role-btn .arrow {
  font-size: 0.7rem;
}

.role-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 250px;
  z-index: 100;
  overflow: hidden;
}

.role-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #333;
  transition: background 0.15s;
}

.role-option:hover {
  background: #f0f4ff;
}

.role-option.selected {
  background: #e8eeff;
  font-weight: 600;
}

.role-option .rol-text {
  color: #666;
  font-weight: normal;
}

/* Admin table styles */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.btn-nuevo {
  background: #0a2463;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-nuevo:hover {
  background: #163d8f;
}

.btn-editar {
  background: #3da5d9;
  color: #fff;
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-editar:hover {
  background: #2b8bbf;
}

.rol-badge {
  background: #e8eeff;
  color: #0a2463;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-badge.activo {
  background: #d4edda;
  color: #155724;
}

.estado-badge.inactivo {
  background: #f8d7da;
  color: #721c24;
}

.badge-lectura {
  display: inline-block;
  background: #fff3cd;
  color: #856404;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}
```

- [ ] **Step 4: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/app.component.ts frontend/src/app/app.component.html frontend/src/styles.css
git commit -m "feat: add role selector to navbar with RBAC-aware navigation"
```

---

## Task 9: Routes Configuration

**Files:**
- Modify: `frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `DashboardComponent`, `EgresadosComponent`, `FormularioEgresadoComponent`, `AdminComponent`
- Produces: Updated route configuration

- [ ] **Step 1: Update app.routes.ts**

```typescript
// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EgresadosComponent } from './features/egresados/egresados.component';
import { FormularioEgresadoComponent } from './features/egresados/formulario-egresado.component';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'egresados', component: EgresadosComponent },
  { path: 'registrar', component: FormularioEgresadoComponent },
  { path: 'admin', component: AdminComponent },
];
```

- [ ] **Step 2: Verify build compiles**

Run: `cd frontend && npx ng build --configuration=development`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/app.routes.ts
git commit -m "feat: update routes with dashboard and admin"
```

---

## Task 10: Final Build Verification and Cleanup

**Files:**
- Verify: all created/modified files

**Interfaces:**
- Consumes: all previous tasks
- Produces: fully working build

- [ ] **Step 1: Full production build**

Run: `cd frontend && npx ng build`
Expected: BUILD SUCCESSFUL with no errors

- [ ] **Step 2: Verify dev server starts**

Run: `cd frontend && npx ng serve --port 4200`
Expected: Server starts, accessible at http://localhost:4200

- [ ] **Step 3: Manual smoke test**

Verify in browser:
- [ ] Default route redirects to /dashboard
- [ ] Dashboard shows 3 KPI cards with correct data
- [ ] Egresados table shows data, filters work
- [ ] Admin table shows 5 users
- [ ] Role selector in navbar works — switching to "Juan Estudiante" hides Edit/Eliminar/Registrar buttons
- [ ] Switching back to "Admin General" restores buttons

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: pisunpa UI expansion complete — dashboard, admin, RBAC"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Models + Auth Service + Usuarios Service | 4 files |
| 2 | StatCard component | 1 file |
| 3 | Modal component | 1 file |
| 4 | Dashboard with KPIs | 1 file |
| 5 | Migrate egresados to features/ | 3-4 files |
| 5b | Egresado edit modal | 2 new + 2 modified |
| 6 | Admin component | 2 files |
| 7 | UsuarioModal component | 2 files |
| 8 | Navbar role selector + styles | 3 files modified |
| 9 | Routes | 1 file modified |
| 10 | Final verification | — |

**Total:** ~18 new files, ~7 modified files
