import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface NewStandFormValue {
  ordre: string;
  nom: string;
  soustitre: string;
}

@Component({
  selector: 'app-modal-new-stand',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modalNewStand.component.html',
  styleUrl: './modalNewStand.component.scss'
})
export class ModalNewStandComponent {
  data: { title?: string; ordre?: string } = {};
  submitted = false;

  standForm = this.formBuilder.nonNullable.group({
    ordre: ['', [Validators.required, Validators.minLength(1)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    soustitre: ['']
  });

  constructor(
    public dialogRef: NgbActiveModal,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.standForm.patchValue({ ordre: this.data.ordre ?? '' });
  }

  cancel(): void {
    this.dialogRef.close('cancel');
  }

  accept(): void {
    this.submitted = true;
    if (this.standForm.valid) {
      this.dialogRef.close(this.standForm.getRawValue());
    }
  }
}
