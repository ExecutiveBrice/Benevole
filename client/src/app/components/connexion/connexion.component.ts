import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Benevole, Croisement, Evenement } from '../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BenevoleService, TransmissionService } from '../../services';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderByPipe } from "../../services/sort.pipe";
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, OrderByPipe, MatIconModule],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.scss'
})
export class ConnexionComponent implements OnInit {

  @Input() evenement!: Evenement;
  @Input() benevole: Benevole | undefined = undefined;
  @Output() actionEmitter: EventEmitter<boolean> = new EventEmitter;
  constructor(
    public benevoleService: BenevoleService,
    public transmissionService: TransmissionService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    if(this.evenement.needtel){
      this.formulaireBenevole.get('telephone')?.enable()
    }else{
    this.formulaireBenevole.get('telephone')?.disable()
    }
    if(!this.evenement.basique){
      this.formulaireBenevole.get('nom')?.enable()
    }else{
      this.formulaireBenevole.get('nom')?.disable()
    }
    this.transmissionService.benevoleStream.subscribe(benevole => {
      this.benevole = benevole;
    });
  }

  formulaire = this.formBuilder.group({
    email: new FormControl(this.benevole?.email, [Validators.required, Validators.email])
  })

  formulaireBenevole = this.formBuilder.group({
    email: new FormControl(this.benevole?.email, [Validators.required, Validators.email]),
    nom: new FormControl(this.benevole?.nom, [Validators.required, Validators.minLength(2)]),
    prenom: new FormControl(this.benevole?.prenom, [Validators.required, Validators.minLength(2)]),
    telephone: new FormControl(this.benevole?.telephone, [Validators.required, Validators.minLength(2)])
  })

  userExist: boolean = false;
  inconnu: boolean = false;
  find(): void {

    if (this.formulaire.valid) {

      this.benevole = this.formulaire.value as Benevole;

      this.benevole.email = this.benevole?.email.toLowerCase();
      this.benevole.email = this.benevole?.email.trimEnd();
      this.benevole.email = this.benevole?.email.trimStart();

      this.benevoleService.getByMail(this.benevole.email, this.evenement?.id).subscribe({
        next: (benevole) => {

          if (benevole == null) {
            this.formulaireBenevole.get("email")?.setValue(this.benevole?.email);
            this.inconnu = true
          } else {
            this.benevole = benevole;
            this.userExist = true
            this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
            this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
            this.transmissionService.benevoleTransmission(benevole);
            this.actionEmitter.emit(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)

          this.toastr.error(error.message, 'Erreur');

        }

      })
    }
  }


  connexionBasique(){
    let email = this.formulaireBenevole.get('prenom')?.value?.toLowerCase().trimEnd().trimStart().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@nomail.com";
    this.formulaireBenevole.get("email")?.setValue(email);
    this.formulaireBenevole.get("nom")?.setValue("");


    this.benevoleService.getByMail(email, this.evenement?.id).subscribe({
      next: (benevole) => {
        console.log(benevole)
        if (benevole == null) {
          this.addBenevole()

        } else {
          this.benevole = benevole;
          this.userExist = true
          this.formulaireBenevole.get("nom")?.setValue(benevole.nom);
          this.formulaireBenevole.get("prenom")?.setValue(benevole.prenom);
          this.transmissionService.benevoleTransmission(benevole);
          this.actionEmitter.emit(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)

        this.toastr.error(error.message, 'Erreur');

      }

    })


  }


  addBenevole(): void {
    console.log(this.formulaireBenevole)
    if (this.formulaireBenevole.valid) {
      this.benevole = this.formulaireBenevole.value as Benevole;
      this.benevole.email = this.benevole.email.toLowerCase();
      this.benevole.email = this.benevole.email.trimEnd();
      this.benevole.email = this.benevole.email.trimStart();

      this.benevoleService.add(this.benevole, this.evenement?.id).subscribe({
        next: (benevole) => {
          benevole.croisements = [];
          this.benevole = benevole;

          this.userExist = true;
          this.transmissionService.benevoleTransmission(benevole);
          this.actionEmitter.emit(false);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)

          this.toastr.error(error.message, 'Erreur');

        }

      })
    }
  }

  retraitCroisement(croisement: Croisement) {
    if (this.benevole) {
      this.benevoleService.removeToCroisement(this.benevole?.id, croisement.id).subscribe({
        next: (benevole) => {
          this.transmissionService.benevoleTransmission(benevole);
          this.toastr.success("Votre choix à bien été retirée", "Merci,")
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          this.toastr.error(error.message, 'Erreur');
        }
      })
    }
  }



}
