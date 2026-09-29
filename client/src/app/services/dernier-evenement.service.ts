import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const LAST_VIEWED_EVENT_ID_KEY = 'benevole.last-viewed-event-id';

/** Persists the event to reopen when the application starts. */
@Injectable({ providedIn: 'root' })
export class DernierEvenementService {
  private readonly platformId = inject(PLATFORM_ID);

  save(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      return;
    }

    try {
      this.storage?.setItem(LAST_VIEWED_EVENT_ID_KEY, String(id));
    } catch {
      // Storage may be unavailable (for example in a private browsing context).
    }
  }

  get(): number | null {
    try {
      const value = this.storage?.getItem(LAST_VIEWED_EVENT_ID_KEY);
      const id = Number(value);

      return Number.isSafeInteger(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  }

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }
}
