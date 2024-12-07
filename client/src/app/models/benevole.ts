import { FormGroup } from "@angular/forms";
import { Croisement } from "./croisement";
import { Evenement } from './evenement';



export class Benevole {
  id!: number;
  prenom!: string;
  nom!: string;
  email!: string;
  telephone!: string;
  croisements!: Croisement[];
  evenement!: Evenement;
  formulaire!: FormGroup;
  constructor() {
    this.croisements = []
  }
}