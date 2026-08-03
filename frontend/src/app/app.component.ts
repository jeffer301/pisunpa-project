import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ROL_LABELS, Rol } from './core/auth/role.model';
import { FeedbackBannerComponent } from './shared/components/feedback-banner/feedback-banner.component';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FeedbackBannerComponent, NotificationBellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  rolLabel = computed(() => {
    const usuario = this.authService.usuarioActivo();
    if (!usuario) return '';
    return ROL_LABELS[usuario.rol as Rol] ?? usuario.rol ?? '';
  });

  nombreUsuario = computed(() => {
    const u = this.authService.usuarioActivo();
    if (!u) return '';
    if (u.nombre) return u.nombre;
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  });

  readonly esEstudiante = computed(() => this.authService.tieneRol('estudiante', 'egresado'));
  readonly esEstudianteSolo = computed(() => this.authService.tieneRol('estudiante'));
  readonly esProfesor = computed(() => this.authService.tieneRol('profesor'));
  readonly esAdmin = computed(() => this.authService.tieneRol('administrador', 'director', 'secretario'));
  readonly esCoordinador = computed(() => this.authService.esCoordinador());

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
