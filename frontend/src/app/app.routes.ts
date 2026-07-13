import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EgresadosComponent } from './features/egresados/egresados.component';
import { FormularioEgresadoComponent } from './features/egresados/formulario-egresado.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'egresados', component: EgresadosComponent },
  { path: 'registrar', component: FormularioEgresadoComponent },
];
