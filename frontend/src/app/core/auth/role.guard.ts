import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './role.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data?.['roles'] as Rol[] | undefined;

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  const rolActual = authService.rolActual();

  if (rolActual && rolesPermitidos.includes(rolActual as Rol)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
