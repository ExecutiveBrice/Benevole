import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modalAccessGestion',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './modalAccessGestion.component.html',
  styleUrl: './modalAccessGestion.component.scss'
})
export class ModalAccessGestionComponent {
  data: { title?: string; question?: string } = {};
  passwordVisible:boolean=false
  resetMode = false;
  resetSent = false;
  resetError = false;
  connexionEnCours = false;
  connexionError = '';
  private destroyRef = inject(DestroyRef);

  authorizeForm = this.formBuilder.group({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])

  })

  resetForm = this.formBuilder.group({
    email: new FormControl("", [Validators.required, Validators.email])
  })


  constructor(public dialogRef: NgbActiveModal,
    
    public formBuilder: FormBuilder,
    private authService: AuthService
  ){
  }

  cancel() {
    if (!this.connexionEnCours) {
      this.dialogRef.close(false);
    }
  }

  accept(): void {
    if (this.authorizeForm.invalid || this.connexionEnCours) {
      return;
    }
    this.connexionEnCours = true;
    this.connexionError = '';
    const { username, password } = this.authorizeForm.getRawValue();
    this.authService.login(username!, password!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.connexionEnCours = false;
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.connexionEnCours = false;
        this.connexionError = error.status === 401
          ? 'Identifiant ou mot de passe incorrect.'
          : 'La connexion au serveur a échoué. Veuillez réessayer.';
      }
    });
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
