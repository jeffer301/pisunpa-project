import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EgresadosComponent } from './features/egresados/egresados.component';
import { FormularioEgresadoComponent } from './features/egresados/formulario-egresado.component';
import { AdminComponent } from './features/admin/admin.component';
import { SolicitudSupletorioComponent } from './features/estudiante/solicitud-supletorio/solicitud-supletorio.component';
import { PagoSupletorioComponent } from './features/estudiante/pago-supletorio/pago-supletorio.component';
import { BandejaSupletoriosComponent } from './features/admin/bandeja-supletorios/bandeja-supletorios.component';
import { GestionEgresadosComponent } from './features/admin/gestion-egresados/gestion-egresados.component';
import { AnaliticaEgresadosComponent } from './features/dashboard/analitica-egresados/analitica-egresados.component';
import { ObjetivosProyectoComponent } from './features/dashboard/objetivos-proyecto/objetivos-proyecto.component';
import { SupletoriosPendientesComponent } from './features/profesor/supletorios-pendientes/supletorios-pendientes.component';
import { RegistroComponent } from './features/registro/registro.component';
import { PortalEgresadoComponent } from './features/portal-egresado/portal-egresado.component';
import { RegistroManualComponent } from './features/registro-manual/registro-manual.component';
import { RegistroDocenteComponent } from './features/registro-docente/registro-docente.component';
import { RegistroEstudianteComponent } from './features/registro-estudiante/registro-estudiante.component';
import { EstudiantesPendientesComponent } from './features/admin/estudiantes-pendientes/estudiantes-pendientes.component';
import { ProfesoresComponent } from './features/admin/profesores/profesores.component';
import { AsignacionProfesoresComponent } from './features/admin/asignacion-profesores/asignacion-profesores.component';
import { ProgramaComponent } from './features/programa/programa.component';
import { DocentesComponent } from './features/docentes/docentes.component';
import { InvestigacionComponent } from './features/investigacion/investigacion.component';
import { LandingComponent } from './features/landing/landing.component';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { Rol } from './core/auth/role.model';

const rolesAdmin = ['administrador', 'director', 'secretario'] as Rol[];
const rolesEstudiante = ['estudiante', 'egresado'] as Rol[];

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: '', component: LandingComponent },
  { path: 'programa', component: ProgramaComponent },
  { path: 'docentes', component: DocentesComponent },
  { path: 'investigacion', component: InvestigacionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'registro/docente', component: RegistroDocenteComponent },
  { path: 'registro/estudiante', redirectTo: 'registro' },
  { path: 'registro-egresado', redirectTo: 'registro' },
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'egresados', component: EgresadosComponent, canActivate: [authGuard] },
  { path: 'registrar', component: FormularioEgresadoComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'estudiante/solicitud-supletorio', component: SolicitudSupletorioComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesEstudiante } },
  { path: 'estudiante/pago-supletorio', component: PagoSupletorioComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesEstudiante } },
  { path: 'egresado/perfil', component: PortalEgresadoComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesEstudiante } },
  { path: 'admin/bandeja-supletorios', component: BandejaSupletoriosComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'profesor/supletorios-pendientes', component: SupletoriosPendientesComponent, canActivate: [authGuard, roleGuard], data: { roles: ['profesor'] as Rol[] } },
  { path: 'admin/estudiantes-pendientes', component: EstudiantesPendientesComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'admin/profesores', component: ProfesoresComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'admin/asignacion-profesores', component: AsignacionProfesoresComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'admin/gestion-egresados', component: GestionEgresadosComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'dashboard/analitica-egresados', component: AnaliticaEgresadosComponent, canActivate: [authGuard, roleGuard], data: { roles: rolesAdmin } },
  { path: 'dashboard/objetivos-proyecto', component: ObjetivosProyectoComponent, canActivate: [authGuard] },
  {
    path: 'admin/eventos',
    loadComponent: () =>
      import('./features/admin/admin-eventos/admin-eventos.component').then(
        (m) => m.AdminEventosComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['coordinador', 'administrador', 'director', 'secretario'] as Rol[] },
  },
  {
    path: 'admin/roles',
    loadComponent: () =>
      import('./features/admin/gestion-roles/gestion-roles.component').then(
        (m) => m.GestionRolesComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'director'] as Rol[] },
  },
];
