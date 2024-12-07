import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { Benevole } from '../../models';
import { map, Observable, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modalAddBen',
  standalone: true,
  imports: [AsyncPipe, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule],
  templateUrl: './modalAddBen.component.html',
  styleUrl: './modalAddBen.component.scss'
})
export class ModalAddBenComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);

  benevoles:Benevole[]=[]



  benevoleForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    nom: new FormControl('', [Validators.required, Validators.minLength(2)]),
    prenom: new FormControl('', [Validators.required, Validators.minLength(2)]),
    telephone: new FormControl('', [Validators.required, Validators.minLength(2)]),
    id: new FormControl(0, [])
  })



  constructor(public dialogRef: MatDialogRef<ModalAddBenComponent>,
    public formBuilder: FormBuilder
  ) {
console.log(this.data);

  }
  myControl = new FormControl<string | Benevole>('');
  filteredOptions!: Observable<Benevole[]>;
  displayFn(ben: Benevole): string {
    return ben ? ben.prenom + ' ' + ben.nom : '';
  }

  ngOnInit(): void {
    this.benevoles = this.data.benevoles

    if(this.data.needtel){
      this.benevoleForm.get('telephone')?.enable()
    }else{
      this.benevoleForm.get('telephone')?.disable()
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.prenom;
        return name ? this._filter(name as string) : this.data.benevoles.slice();
      }),
    );
  }

  cancel() {
    this.dialogRef.close('cancel');
  }

  accept() {

    if (this.benevoleForm.valid) {
      this.dialogRef.close(this.benevoleForm.value);
    }

  }


  selectBen(benevole: Benevole) {
    this.benevoleForm.get('prenom')?.setValue(benevole.prenom);
    this.benevoleForm.get('nom')?.setValue(benevole.nom);
    this.benevoleForm.get('email')?.setValue(benevole.email);
    this.benevoleForm.get('telephone')?.setValue(benevole.telephone);
    this.benevoleForm.get('id')?.setValue(benevole.id);
  }

  private _filter(name: string): Benevole[] {
    const filterValue = name.toLowerCase();
    return this.benevoles.filter(ben => ben.nom?.toLowerCase().includes(filterValue) || ben.prenom?.toLowerCase().includes(filterValue));
  }
}
