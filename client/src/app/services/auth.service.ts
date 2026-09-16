import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

const AUTHORIZATION_KEY = 'benevole.basic-authorization';

/** Conserve l'autorisation Basic jusqu'à la déconnexion explicite de l'utilisateur. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): void {
    localStorage.setItem(AUTHORIZATION_KEY, `Basic ${btoa(`${username}:${password}`)}`);
  }

  authorizationHeader(): string | null {
    const authorization = localStorage.getItem(AUTHORIZATION_KEY)
      ?? sessionStorage.getItem(AUTHORIZATION_KEY);
    if (authorization) {
      localStorage.setItem(AUTHORIZATION_KEY, authorization);
    }
    return authorization;
  }

  isAuthenticated(): boolean {
    return this.authorizationHeader() !== null;
  }

  logout(): void {
    localStorage.removeItem(AUTHORIZATION_KEY);
    sessionStorage.removeItem(AUTHORIZATION_KEY);
  }

  requestPasswordReset(email: string) {
    return this.http.post<void>(`${environment.url}auth/mot-de-passe/reinitialisation`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<void>(`${environment.url}auth/mot-de-passe/confirmation`, { token, password });
  }
}
