import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DernierEvenementService } from '../services/dernier-evenement.service';

/** Opens the last viewed event unless the user explicitly requests the event list. */
export const redirectToLastEvent: CanActivateFn = route => {
  if (route.queryParamMap.has('liste')) {
    return true;
  }

  const eventId = inject(DernierEvenementService).get();
  return eventId === null ? true : inject(Router).createUrlTree(['/', eventId]);
};
