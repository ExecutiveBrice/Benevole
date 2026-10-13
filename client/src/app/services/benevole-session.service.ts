import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const VOLUNTEER_EMAIL_KEY = 'benevoleEmail';

/** Keeps the identified volunteer across browser and PWA restarts until logout. */
@Injectable({ providedIn: 'root' })
export class BenevoleSessionService {
  private readonly platformId = inject(PLATFORM_ID);

  saveEmail(email: string): void {
    if (!email) {
      return;
    }

    try {
      this.localStorage?.setItem(VOLUNTEER_EMAIL_KEY, JSON.stringify(email));
      this.sessionStorage?.removeItem(VOLUNTEER_EMAIL_KEY);
    } catch {
      // Storage can be disabled by the browser or the PWA host.
    }
  }

  getEmail(): string | null {
    try {
      const email = this.parseEmail(this.localStorage?.getItem(VOLUNTEER_EMAIL_KEY));
      if (email !== null) {
        return email;
      }

      // Preserve volunteers identified before persistent storage was restored.
      const legacyEmail = this.parseEmail(this.sessionStorage?.getItem(VOLUNTEER_EMAIL_KEY));
      if (legacyEmail !== null) {
        this.saveEmail(legacyEmail);
      }
      return legacyEmail;
    } catch {
      return null;
    }
  }

  clear(): void {
    try {
      this.sessionStorage?.removeItem(VOLUNTEER_EMAIL_KEY);
      this.localStorage?.removeItem(VOLUNTEER_EMAIL_KEY);
    } catch {
      // Storage can be disabled by the browser or the PWA host.
    }
  }

  private parseEmail(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      const email = JSON.parse(value);
      return typeof email === 'string' && email.length > 0 ? email : null;
    } catch {
      return null;
    }
  }

  private get sessionStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage : null;
  }

  private get localStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }
}
