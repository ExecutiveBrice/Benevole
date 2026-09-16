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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modalAccessGestion',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatInputModule, MatFormFieldModule,MatIconModule],
  templateUrl: './modalAccessGestion.component.html',
  styleUrl: './modalAccessGestion.component.scss'
})
export class ModalAccessGestionComponent {
  data = inject(MAT_DIALOG_DATA);
  passwordVisible:boolean=false
  resetMode = false;
  resetSent = false;
  resetError = false;

  authorizeForm = this.formBuilder.group({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])

  })

  resetForm = this.formBuilder.group({
    email: new FormControl("", [Validators.required, Validators.email])
  })


  constructor(public dialogRef: MatDialogRef<ModalAccessGestionComponent>,
    
    public formBuilder: FormBuilder,
    private authService: AuthService
  ){
  }

  cancel() {
    this.dialogRef.close('cancel');
  }

  accept(form:FormGroup) {
    if (form.valid) {
      this.dialogRef.close(form);
    }
  }

  requestPasswordReset(): void {
    if (this.resetForm.invalid) {
      return;
    }
    this.resetError = false;
    this.authService.requestPasswordReset(this.resetForm.get('email')?.value ?? '').subscribe({
      next: () => this.resetSent = true,
      error: () => this.resetError = true
    });
  }

  showLogin(): void {
    this.resetMode = false;
    this.resetSent = false;
    this.resetError = false;
  }

  
}
