import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Croisement } from "./croisement";
import { Evenement } from './evenement';



export class Benevole {
  id!: number;
  prenom!: string;
  nom!: string;
  email!: string;
  telephone!: string;
  croisements!: Croisement[];
  commentaire!: string;
  reponse!: string;
  evenement!:Evenement;
formulaire!:FormGroup;
  constructor(){
    this.croisements = []
  }
}