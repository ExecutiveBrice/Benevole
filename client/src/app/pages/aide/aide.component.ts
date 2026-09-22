import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DemandeCreationEvenementService, ToastService } from '../../services';

@Component({
  selector: 'app-aide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './aide.component.html',
  styleUrls: ['./aide.component.scss']
})
export class AideComponent {
  envoiEnCours = false;
  demandeEnvoyee = false;

  readonly formulaire = this.formBuilder.group({
    eventName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    contact: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    contactTel: ['', [Validators.maxLength(50)]],
    endDate: [null as string | null],
    sitepersourl: ['', [Validators.maxLength(500)]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private demandeService: DemandeCreationEvenementService,
    private toastr: ToastService
  ) {}

  envoyer(): void {
    if (this.formulaire.invalid || this.envoiEnCours) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.envoiEnCours = true;
    const valeur = this.formulaire.getRawValue();
    this.demandeService.creer({
      eventName: valeur.eventName ?? '',
      contact: valeur.contact ?? '',
      contactEmail: valeur.contactEmail ?? '',
      contactTel: valeur.contactTel ?? '',
      endDate: valeur.endDate,
      sitepersourl: valeur.sitepersourl ?? ''
    }).subscribe({
      next: () => {
        this.envoiEnCours = false;
        this.demandeEnvoyee = true;
        this.formulaire.reset({ eventName: '', contact: '', contactEmail: '', contactTel: '', endDate: null, sitepersourl: '' });
        this.toastr.success('Votre demande a été transmise.', 'Demande envoyée');
      },
      error: (error: HttpErrorResponse) => {
        this.envoiEnCours = false;
        this.toastr.error(error.error?.message || 'Votre demande n’a pas pu être envoyée.', 'Erreur');
      }
    });
  }
}
