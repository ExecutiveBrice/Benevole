import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Ajoute le JWT aux appels protégés et purge la session si le serveur le refuse. */
export const jwtAuthenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.url);
  const isAuthenticationRequest = request.url.startsWith(`${environment.url}auth/`);
  const requiresAuthentication = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    || request.url.startsWith(`${environment.url}administrateurs`)
    || request.url === `${environment.url}config/getProps`;

  const authorization = isApiRequest && !isAuthenticationRequest && requiresAuthentication
    ? authService.authorizationHeader()
    : null;
  const authenticatedRequest = authorization
    ? request.clone({ setHeaders: { Authorization: authorization } })
    : request;
  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (authorization && error.status === 401 && authService.authorizationHeader() === authorization) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
