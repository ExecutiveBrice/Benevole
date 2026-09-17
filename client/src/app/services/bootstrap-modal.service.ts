import { Injectable, Type } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { merge, Observable } from 'rxjs';

export interface BootstrapModalOptions extends NgbModalOptions {
  data?: unknown;
  height?: string;
  width?: string;
  hasBackdrop?: boolean;
  disableClose?: boolean;
  backdropClass?: string;
}

interface ModalContent {
  data: unknown;
}

@Injectable({ providedIn: 'root' })
export class BootstrapModalService {
  constructor(private readonly modal: NgbModal) {}

  open<T extends ModalContent, Result = any>(component: Type<T>, options: BootstrapModalOptions = {}): { afterClosed: () => Observable<Result> } {
    const { data, height, width, hasBackdrop, disableClose, backdropClass, ...ngbOptions } = options;
    const ref = this.modal.open(component, {
      ...ngbOptions,
      backdrop: hasBackdrop === false ? false : true,
      backdropClass,
      keyboard: !disableClose,
      centered: true,
      windowClass: [width ? 'modal-dialog-scrollable' : undefined].filter(Boolean).join(' '),
      size: width === '50%' ? 'lg' : undefined
    });
    ref.componentInstance.data = data;

    return { afterClosed: () => merge(ref.closed, ref.dismissed) as Observable<Result> };
  }
}
