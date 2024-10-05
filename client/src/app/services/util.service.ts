import { Injectable, inject } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "../pages/modal/modal.component";


@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private modalService = inject(NgbModal);

  public openModal(body: string, title: string, accepter: boolean, refuser: boolean, consultation: boolean, size: string): Promise<any> {
    const modalRef = this.modalService.open(ModalComponent, {
      animation: true,
      size: size,
      centered: true,
      backdrop: 'static',
      scrollable: true
    });
    modalRef.componentInstance.body = body;
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.accepter = accepter;
    modalRef.componentInstance.refuser = refuser;
    modalRef.componentInstance.consultation = consultation;
    return modalRef.result;
  }

}