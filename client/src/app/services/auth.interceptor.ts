import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Ajoute les identifiants Spring Security aux seuls appels vers l'API de l'application. */
export const basicAuthenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const authorization = inject(AuthService).authorizationHeader();
  const isApiRequest = request.url.startsWith(environment.url);
  const requiresAuthentication = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    || request.url === `${environment.url}administrateurs/moi`
    || request.url === `${environment.url}config/getProps`;

  if (!authorization || !isApiRequest || !requiresAuthentication) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: authorization } }));
};
