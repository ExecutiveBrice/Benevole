import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface NewCreneauFormValue {
  ordre: string;
  plage: string;
}

@Component({
  selector: 'app-modal-new-creneau',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modalNewCreneau.component.html',
  styleUrl: './modalNewCreneau.component.scss'
})
export class ModalNewCreneauComponent implements OnInit {
  data: { title?: string; ordre?: string } = {};
  submitted = false;

  creneauForm = this.formBuilder.nonNullable.group({
    ordre: ['', [Validators.required, Validators.minLength(1)]],
    plage: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    public dialogRef: NgbActiveModal,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.creneauForm.patchValue({ ordre: this.data.ordre ?? '' });
  }

  cancel(): void {
    this.dialogRef.close('cancel');
  }

  accept(): void {
    this.submitted = true;
    if (this.creneauForm.valid) {
      this.dialogRef.close(this.creneauForm.getRawValue());
    }
  }
}
