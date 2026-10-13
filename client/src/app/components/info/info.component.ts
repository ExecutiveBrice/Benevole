import QRCode from 'qrcode';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Benevole, Croisement, Evenement } from '../../models';
import { OrderByPipe } from "../../services/sort.pipe";
import { ConfigService, FileService, ToastService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';
import { createEventCalendar } from '../../utils/event-calendar';


@Component({
  selector: 'app-info',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit {

  @Input() evenement!: Evenement;

  qrcode?: string;
  using_address = '';
  affiche!: string;
  logo?: string;
  constructor(
    public fileService: FileService,
    private configService: ConfigService,
    private changeDetectorRef: ChangeDetectorRef,
    private toastr: ToastService,
  ) { }
  ngOnInit(): void {
    this.getLogo();
    this.getAffiche();
    this.getRegistrationLink();
  }



  getRegistrationLink(): void {
    this.configService.getParams().subscribe({
      next: params => {
        this.using_address = params.url + this.evenement.id;
        this.generateQRCode();
        this.changeDetectorRef.markForCheck();
      },
      error: error => console.error(error)
    });
  }

  private generateQRCode(): void {
    // With promises
    QRCode.toDataURL(this.using_address, { errorCorrectionLevel: 'H', width: 500 })
      .then((qrcode: string) => {
        this.qrcode = qrcode;
        this.changeDetectorRef.markForCheck();
      })
      .catch((err: any) => {
        console.error(err)
      })

  }

  async copyRegistrationLink(): Promise<void> {
    if (!this.using_address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.using_address);
      this.toastr.success('Le lien d’inscription a été copié dans le presse-papiers.', 'Lien copié');
    } catch (error) {
      console.error('Impossible de copier le lien d’inscription.', error);
      this.toastr.error('La copie du lien a échoué. Vous pouvez le sélectionner puis le copier.', 'Erreur');
    }
  }




  getLogo(): void {
    this.fileService.get(this.evenement.id, 'logo.jpeg').subscribe({
      next: data => {
        this.logo = data?.trim() ? `data:image/jpeg;base64,${data}` : undefined;
        this.changeDetectorRef.markForCheck();
      },
      // L'absence de logo est un état normal : ne rien afficher.
      error: () => {
        this.logo = undefined;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  hideLogo(): void {
    this.logo = undefined;
  }

  async copyContact(value: string): Promise<void> {
    const text = value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.toastr.success('Copié dans le presse-papiers.');
    } catch {
      this.toastr.error('La copie a échoué. Vous pouvez sélectionner le texte pour le copier.');
    }
    this.changeDetectorRef.markForCheck();
  }

  get directionsUrl(): string {
    const destination = encodeURIComponent(this.evenement.adresse?.trim() ?? '');
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&dir_action=navigate`;
  }

  addToCalendar(): void {
    if (!this.evenement.dateEvenement) return;
    const applicationUrl = new URL(document.baseURI);
    applicationUrl.pathname = `${applicationUrl.pathname.replace(/\/$/, '')}/${this.evenement.id}`;
    applicationUrl.search = '';
    applicationUrl.hash = '';
    const calendar = createEventCalendar(this.evenement, applicationUrl.href);
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `evenement-${this.evenement.id}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  getAffiche() {
    this.fileService.get(this.evenement.id, 'affiche.jpeg').subscribe({
      next: (data) => {
        this.affiche = "data:image/jpeg;base64," + data
        // L'affiche est chargée après le premier rendu de la colonne Info.
        // Marquer le composant garantit que l'image est affichée dès réception.
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }

    })
  }

}
