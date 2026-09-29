import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const VOLUNTEER_EMAIL_KEY = 'benevoleEmail';

/** Keeps the identified volunteer for the lifetime of the current browser or PWA session. */
@Injectable({ providedIn: 'root' })
export class BenevoleSessionService {
  private readonly platformId = inject(PLATFORM_ID);

  saveEmail(email: string): void {
    if (!email) {
      return;
    }

    try {
      this.sessionStorage?.setItem(VOLUNTEER_EMAIL_KEY, JSON.stringify(email));
    } catch {
      // Storage can be disabled by the browser or the PWA host.
    }
  }

  getEmail(): string | null {
    try {
      const email = this.parseEmail(this.sessionStorage?.getItem(VOLUNTEER_EMAIL_KEY));
      if (email !== null) {
        return email;
      }

      // Preserve the identified volunteer for users upgrading from the former
      // localStorage implementation, then keep subsequent data in sessionStorage.
      const legacyEmail = this.parseEmail(this.localStorage?.getItem(VOLUNTEER_EMAIL_KEY));
      if (legacyEmail !== null) {
        this.saveEmail(legacyEmail);
        this.localStorage?.removeItem(VOLUNTEER_EMAIL_KEY);
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

    const email = JSON.parse(value);
    return typeof email === 'string' && email.length > 0 ? email : null;
  }

  private get sessionStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage : null;
  }

  private get localStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }
}
