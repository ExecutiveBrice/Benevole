import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const AUTHORIZATION_KEY = 'benevole.jwt';
const AUTHORIZATION_EXPIRATION_KEY = 'benevole.jwt-expiration';

interface AuthenticationToken {
  token: string;
  expiresAt: number;
}

/** Conserve un JWT jusqu'à son expiration ou une déconnexion explicite. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    return this.http.post<AuthenticationToken>(`${environment.url}auth/connexion`, { username, password }).pipe(
      tap(({ token, expiresAt }) => {
        localStorage.setItem(AUTHORIZATION_KEY, token);
        localStorage.setItem(AUTHORIZATION_EXPIRATION_KEY, String(expiresAt));
        sessionStorage.removeItem(AUTHORIZATION_KEY);
        localStorage.removeItem('benevole.basic-authorization');
        sessionStorage.removeItem('benevole.basic-authorization');
      }),
      map(() => undefined),
    );
  }

  authorizationHeader(): string | null {
    const token = localStorage.getItem(AUTHORIZATION_KEY);
    if (!token || this.isExpired(token)) {
      this.logout();
      return null;
    }
    return `Bearer ${token}`;
  }

  isAuthenticated(): boolean {
    return this.authorizationHeader() !== null;
  }

  logout(): void {
    localStorage.removeItem(AUTHORIZATION_KEY);
    localStorage.removeItem(AUTHORIZATION_EXPIRATION_KEY);
    sessionStorage.removeItem(AUTHORIZATION_KEY);
    localStorage.removeItem('benevole.basic-authorization');
    sessionStorage.removeItem('benevole.basic-authorization');
  }

  private isExpired(token: string): boolean {
    const storedExpiration = Number(localStorage.getItem(AUTHORIZATION_EXPIRATION_KEY));
    if (Number.isFinite(storedExpiration) && storedExpiration > 0) {
      return Date.now() >= storedExpiration * 1000;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }
      const payload = parts[1];
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
      const expiration = JSON.parse(atob(paddedPayload)).exp;
      if (typeof expiration !== 'number' || !Number.isFinite(expiration)) {
        return true;
      }
      localStorage.setItem(AUTHORIZATION_EXPIRATION_KEY, String(expiration));
      return Date.now() >= expiration * 1000;
    } catch {
      return true;
    }
  }

  requestPasswordReset(email: string) {
    return this.http.post<void>(`${environment.url}auth/mot-de-passe/reinitialisation`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<void>(`${environment.url}auth/mot-de-passe/confirmation`, { token, password });
  }
}
