import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ROL_LABELS } from './core/auth/role.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  rolLabel = computed(() => ROL_LABELS[this.authService.usuarioActivo().rol]);

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}
