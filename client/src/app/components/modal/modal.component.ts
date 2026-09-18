import {Component} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  data: { title?: string; question?: string } = {};

  constructor(public dialogRef: NgbActiveModal){}

  cancel() {
    this.dialogRef.close('cancel');
  }

  accept() {
    this.dialogRef.close('accept');
  }
}
