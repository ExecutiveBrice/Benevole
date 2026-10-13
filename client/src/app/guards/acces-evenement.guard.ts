import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protège les pages de gestion tout en permettant d'ouvrir leur connexion. */
export const accesEvenement: CanActivateFn = route => {
  if (inject(AuthService).isAuthenticated()) {
    return true;
  }

  if (route.routeConfig?.path === ':id/gestion' && route.queryParamMap.get('connexion') === '1') {
    return true;
  }

  return inject(Router).createUrlTree(['/', route.paramMap.get('id')]);
};
