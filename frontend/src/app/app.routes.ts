import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EgresadosComponent } from './features/egresados/egresados.component';
import { FormularioEgresadoComponent } from './features/egresados/formulario-egresado.component';
import { AdminComponent } from './features/admin/admin.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'egresados', component: EgresadosComponent, canActivate: [authGuard] },
  { path: 'registrar', component: FormularioEgresadoComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
];
