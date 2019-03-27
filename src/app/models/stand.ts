import { Croisement } from "./croisement";




export class Stand {
  id:number;
  nom: string;
  description:string;
  limite:number;
  Croisements: Croisement[];
  croisements: Croisement[];
}