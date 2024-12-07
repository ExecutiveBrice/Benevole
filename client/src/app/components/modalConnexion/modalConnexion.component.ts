import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modalConnexion',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatInputModule, MatFormFieldModule,MatIconModule],
  templateUrl: './modalConnexion.component.html',
  styleUrl: './modalConnexion.component.scss'
})
export class ModalConnexionComponent {
  data = inject(MAT_DIALOG_DATA);
  passwordVisible:boolean=false

  authorizeForm = this.formBuilder.group({
    passwood: new FormControl("", [Validators.required])

  })


  constructor(public dialogRef: MatDialogRef<ModalConnexionComponent>,
    
    public formBuilder: FormBuilder
  ){
console.log(this.authorizeForm);


  }

  cancel() {
    this.dialogRef.close('cancel');
  }

  accept(password:FormGroup) {
    console.log(password);
    
    this.dialogRef.close(password);
  }

  
}
