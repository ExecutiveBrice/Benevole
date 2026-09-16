import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'danger';

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts: Toast[] = [];
  private nextId = 0;

  success(message: string, title?: string): void {
    this.show(message, title, 'success');
  }

  info(message: string, title?: string): void {
    this.show(message, title, 'info');
  }

  warning(message: string, title?: string): void {
    this.show(message, title, 'warning');
  }

  error(message: string, title?: string): void {
    this.show(message, title, 'danger');
  }

  remove(toast: Toast): void {
    const index = this.toasts.indexOf(toast);
    if (index !== -1) {
      this.toasts.splice(index, 1);
    }
  }

  private show(message: string, title: string | undefined, type: ToastType): void {
    this.toasts.push({ id: this.nextId++, message, title, type });
  }
}
