import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.usuarioActivo()) {
    return true;
  }

  if (authService.estaAutenticado()) {
    return authService.cargarPerfil().pipe(
      map(() => true),
      catchError(() => {
        authService.cerrarSesion();
        return of(router.createUrlTree(['/login']));
      })
    );
  }

  return router.createUrlTree(['/login']);
};
