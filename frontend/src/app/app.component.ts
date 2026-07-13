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
