import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  data = inject(MAT_DIALOG_DATA);

  constructor(public dialogRef: MatDialogRef<ModalComponent>){}

  cancel() {
    this.dialogRef.close('cancel');
  }

  accept() {
    this.dialogRef.close('accept');
  }
}
