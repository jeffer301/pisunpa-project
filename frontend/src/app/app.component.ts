import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ROL_LABELS } from './core/auth/role.model';
import { FeedbackBannerComponent } from './shared/components/feedback-banner/feedback-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FeedbackBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  rolLabel = computed(() => {
    const usuario = this.authService.usuarioActivo();
    return usuario ? ROL_LABELS[usuario.rol] : '';
  });

  readonly esEstudiante = computed(() => this.authService.tieneRol('estudiante', 'egresado'));
  readonly esProfesor = computed(() => this.authService.tieneRol('profesor'));
  readonly esAdmin = computed(() => this.authService.tieneRol('administrador', 'director', 'secretario'));

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
